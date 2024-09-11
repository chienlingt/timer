import {
  parseJsonFile,
  isValidJsonStructure,
  handleJsonSuccess,
  handleJsonError,
} from "./jsonUtils";

export const processJsonFile = (
  acceptedFiles,
  updateJsonFile,
  updateData,
  displayError,
  updateErrorMessage
) => {
  const file = acceptedFiles[0];
  parseJsonFile(
    file,
    (json) => {
      if (isValidJsonStructure(json)) {
        handleJsonSuccess(json, file, updateJsonFile, updateData, () =>
          displayError(false)
        );
      } else {
        handleJsonError(updateErrorMessage, displayError);
      }
    },
    () => handleJsonError(updateErrorMessage, displayError)
  );
};
