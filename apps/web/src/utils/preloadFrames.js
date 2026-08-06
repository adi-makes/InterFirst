const clampIndex = (index, frameCount) => (
  Math.min(Math.max(Math.floor(index), 0), frameCount - 1)
);

export function createFramePreloader({ concurrency, frameCount, getFramePath }) {
  const records = new Map();
  const queue = [];
  let activeLoads = 0;
  let disposed = false;
  let idleHandle = 0;

  const startQueuedLoads = () => {
    while (!disposed && activeLoads < concurrency && queue.length > 0) {
      const record = queue.shift();
      if (record.status !== "queued") continue;

      record.status = "loading";
      activeLoads += 1;
      const image = new Image();
      record.image = image;
      image.decoding = "async";

      const finish = async (loaded) => {
        if (record.status === "settled") return;
        record.status = "settled";
        activeLoads -= 1;

        if (loaded && !disposed) {
          try {
            await image.decode();
          } catch {
            // onload already proved the image can be drawn.
          }
        }

        record.value = loaded && !disposed ? image : null;
        record.resolve(record.value);
        startQueuedLoads();
      };

      image.onload = () => finish(true);
      image.onerror = () => finish(false);
      image.src = getFramePath(record.index);
    }
  };

  const load = (requestedIndex, { priority = false } = {}) => {
    const index = clampIndex(requestedIndex, frameCount);
    const existing = records.get(index);

    if (existing) {
      if (priority && existing.status === "queued") {
        const queuedIndex = queue.indexOf(existing);
        if (queuedIndex > 0) {
          queue.splice(queuedIndex, 1);
          queue.unshift(existing);
        }
      }
      return existing.promise;
    }

    let resolve;
    const promise = new Promise((resolvePromise) => {
      resolve = resolvePromise;
    });
    const record = {
      image: null,
      index,
      promise,
      resolve,
      status: "queued",
      value: null,
    };

    records.set(index, record);
    if (priority) queue.unshift(record);
    else queue.push(record);
    startQueuedLoads();
    return promise;
  };

  const get = (requestedIndex) => {
    const record = records.get(clampIndex(requestedIndex, frameCount));
    return record?.status === "settled" ? record.value : null;
  };

  const getNearest = (requestedIndex) => {
    const index = clampIndex(requestedIndex, frameCount);
    for (let distance = 0; distance < frameCount; distance += 1) {
      const lower = index - distance;
      const upper = index + distance;
      const lowerImage = lower >= 0 ? get(lower) : null;
      if (lowerImage) return { image: lowerImage, index: lower };
      const upperImage = upper < frameCount ? get(upper) : null;
      if (upperImage) return { image: upperImage, index: upper };
    }
    return null;
  };

  const preloadProgressively = ({ batchSize = 8, indexes }) => {
    let cursor = 0;
    const schedule = () => {
      if (disposed || cursor >= indexes.length) return;
      const runBatch = () => {
        const end = Math.min(cursor + batchSize, indexes.length);
        while (cursor < end) {
          load(indexes[cursor]);
          cursor += 1;
        }
        schedule();
      };

      if ("requestIdleCallback" in window) {
        idleHandle = window.requestIdleCallback(runBatch, { timeout: 350 });
      } else {
        idleHandle = window.setTimeout(runBatch, 32);
      }
    };

    schedule();
  };

  const dispose = () => {
    disposed = true;
    if ("cancelIdleCallback" in window) window.cancelIdleCallback(idleHandle);
    else window.clearTimeout(idleHandle);
    queue.splice(0).forEach((record) => {
      record.status = "settled";
      record.resolve(null);
    });
    records.forEach((record) => {
      if (!record.image) return;
      record.image.onload = null;
      record.image.onerror = null;
      record.image.src = "";
    });
    records.clear();
  };

  return { dispose, get, getNearest, load, preloadProgressively };
}
