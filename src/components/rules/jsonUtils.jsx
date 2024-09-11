import _ from "lodash";

export const isValidJsonStructure = (json) => {
  return (
    Array.isArray(json) &&
    json.every(
      (item) =>
        _.has(item, "环节名称") &&
        _.has(item, "时长") &&
        _.has(item, "双方环节")
    )
  );
};

export const parseJsonFile = (file, onSuccess, onError) => {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result);
      onSuccess(json);
    } catch (e) {
      onError();
    }
  };
  reader.readAsText(file);
};

export const handleJsonSuccess = (
  json,
  file,
  updateJsonFile,
  updateData,
  clearError
) => {
  updateJsonFile(file.name);
  updateData(json);
  clearError();
};

export const handleJsonError = (updateErrorMessage, displayError) => {
  updateErrorMessage(
    "JSON 文件格式错误，请 JSON 文件的每个环节包含：环节名称、时长与双方环节。"
  );
  displayError(true);
};
