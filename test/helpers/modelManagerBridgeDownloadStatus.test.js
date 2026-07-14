const test = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const modelRegistryData = require("../../src/models/modelRegistryData.json");

const originalLoad = Module._load;
const modelManagerModulePath = require.resolve("../../src/helpers/modelManagerBridge.js");
let electronHome = os.tmpdir();

function loadModelManager() {
  delete require.cache[modelManagerModulePath];

  Module._load = function loadWithMocks(request, parent, isMain) {
    if (request === "electron") {
      return {
        app: {
          isReady: () => true,
          getAppPath: () => process.cwd(),
          getPath: (name) => (name === "home" ? electronHome : path.join(electronHome, name)),
        },
        net: {},
      };
    }

    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    return require("../../src/helpers/modelManagerBridge.js").default;
  } finally {
    Module._load = originalLoad;
  }
}

test("getAllModels surfaces in-flight local model download state", async (t) => {
  const tmpHome = await fs.mkdtemp(path.join(os.tmpdir(), "openwhispr-model-status-"));
  electronHome = tmpHome;
  t.after(() => fs.rm(tmpHome, { recursive: true, force: true }));

  const modelManager = loadModelManager();
  const model = modelRegistryData.localProviders[0].models[0];

  modelManager.activeDownloads.set(model.id, true);
  modelManager.downloadProgress.set(model.id, {
    modelId: model.id,
    progress: 42,
    downloadedSize: 420,
    totalSize: 1000,
  });
  t.after(() => {
    modelManager.activeDownloads.clear();
    modelManager.downloadProgress.clear();
  });

  const models = await modelManager.getAllModels();
  const activeModel = models.find((candidate) => candidate.id === model.id);

  assert.equal(activeModel.isDownloaded, false);
  assert.equal(activeModel.isDownloading, true);
  assert.equal(activeModel.downloadProgress, 42);
  assert.equal(activeModel.downloadedSize, 420);
  assert.equal(activeModel.totalSize, 1000);
  assert.equal(activeModel.path, null);
});

test("getAllModels snapshots volatile download state after filesystem checks", async (t) => {
  const tmpHome = await fs.mkdtemp(path.join(os.tmpdir(), "openwhispr-model-snapshot-"));
  electronHome = tmpHome;
  t.after(() => fs.rm(tmpHome, { recursive: true, force: true }));

  const modelManager = loadModelManager();
  const model = modelRegistryData.localProviders[0].models[0];
  const originalCheckModelValid = modelManager.checkModelValid;
  let checkCount = 0;

  modelManager.activeDownloads.set(model.id, true);
  modelManager.downloadProgress.set(model.id, {
    modelId: model.id,
    progress: 42,
    downloadedSize: 420,
    totalSize: 1000,
  });
  modelManager.checkModelValid = async () => {
    checkCount += 1;
    if (checkCount === 2) {
      modelManager.activeDownloads.delete(model.id);
      modelManager.downloadProgress.delete(model.id);
    }
    return false;
  };
  t.after(() => {
    modelManager.checkModelValid = originalCheckModelValid;
    modelManager.activeDownloads.clear();
    modelManager.downloadProgress.clear();
  });

  const models = await modelManager.getAllModels();
  const completedModel = models.find((candidate) => candidate.id === model.id);

  assert.equal(completedModel.isDownloading, false);
  assert.equal(completedModel.downloadProgress, 0);
  assert.equal(completedModel.downloadedSize, 0);
  assert.equal(completedModel.totalSize, 0);
});

test("downloadModel rejects a second local model while another model is active", async (t) => {
  const tmpHome = await fs.mkdtemp(path.join(os.tmpdir(), "openwhispr-single-download-"));
  electronHome = tmpHome;
  t.after(() => fs.rm(tmpHome, { recursive: true, force: true }));

  const modelManager = loadModelManager();
  const [activeModel, requestedModel] = modelRegistryData.localProviders[0].models;

  modelManager.activeDownloads.set(activeModel.id, true);
  t.after(() => {
    modelManager.activeDownloads.clear();
    modelManager.downloadProgress.clear();
  });

  await assert.rejects(
    modelManager.downloadModel(requestedModel.id),
    (error) =>
      error.code === "DOWNLOAD_IN_PROGRESS" &&
      error.details.modelId === requestedModel.id &&
      error.details.activeModelId === activeModel.id
  );
});
