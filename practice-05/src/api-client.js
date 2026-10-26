export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

function assertBaseUrl(baseUrl) {
  if (typeof baseUrl !== "string" || baseUrl.length === 0) {
    throw new TypeError("baseUrl должен быть непустой строкой");
  }
  let url;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new TypeError("baseUrl должен быть абсолютным URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new TypeError("baseUrl должен использовать http или https");
  }
  if (url.search !== "" || url.hash !== "") {
    throw new TypeError("baseUrl не должен содержать query или hash");
  }
  return url;
}

export function buildUrl(baseUrl, path, query = {}) {
  const url = assertBaseUrl(baseUrl);

  if (typeof path !== "string" || path.length === 0) {
    throw new TypeError("path должен быть непустой строкой");
  }

  const base = url.pathname.replace(/\/+$/, "");
  const suffix = path.replace(/^\/+/, "");
  url.pathname = `${base}/${suffix}`;

  for (const [name, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(name, String(value));
  }

  return url.toString();
}

export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 2000,
} = {}) {
  assertBaseUrl(baseUrl);

  if (typeof fetchFn !== "function") {
    throw new TypeError("fetchFn должен быть функцией");
  }
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError("timeoutMs должен быть положительным целым");
  }

  const normalizedBase = baseUrl.replace(/\/+$/, "");

  async function requestJson(path, { query, signal, timeoutMs: overrideTimeout } = {}) {
    const url = buildUrl(normalizedBase, path, query ?? {});
    const effectiveTimeout = overrideTimeout ?? timeoutMs;
    const timeoutSignal = AbortSignal.timeout(effectiveTimeout);
    const combined = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

    let response;
    try {
      response = await fetchFn(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: combined,
      });
    } catch (cause) {
      if (signal?.aborted) {
        throw new ApiError(`Запрос отменён: ${url}`, { kind: "aborted", url, cause });
      }
      if (timeoutSignal.aborted) {
        throw new ApiError(`Время ожидания истекло: ${url}`, { kind: "timeout", url, cause });
      }
      throw new ApiError(`Сетевая ошибка: ${url}`, { kind: "network", url, cause });
    }

    if (!(response instanceof Response)) {
      throw new ApiError("Ответ сервера не является Response", {
        kind: "invalid-response",
        url,
      });
    }

    if (!response.ok) {
      let payload = null;
      try {
        const text = await response.text();
        payload = text.length === 0 ? null : JSON.parse(text);
      } catch {
        payload = null;
      }

      const errorBody = payload && typeof payload === "object" ? payload.error : null;
      const message =
        errorBody && typeof errorBody.message === "string" && errorBody.message.length > 0
          ? errorBody.message
          : `HTTP ${response.status}`;

      throw new ApiError(message, {
        kind: "http",
        status: response.status,
        code: errorBody && typeof errorBody.code === "string" ? errorBody.code : null,
        details: errorBody && errorBody.details !== undefined ? errorBody.details : null,
        url,
      });
    }

    if (response.status === 204) return null;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      throw new ApiError(
        `Ожидался JSON, получен ${contentType || "ответ без Content-Type"}`,
        { kind: "invalid-response", url },
      );
    }

    try {
      return await response.json();
    } catch (cause) {
      throw new ApiError("Не удалось разобрать JSON", {
        kind: "invalid-response",
        url,
        cause,
      });
    }
  }

  return { requestJson };
}