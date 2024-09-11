import PropTypes from "prop-types";

const FileInput = ({ handleFileUpload }) => (
  <div className="mb-4">
    <input type="file" accept=".json" onChange={handleFileUpload} />
  </div>
);

FileInput.propTypes = {
  handleFileUpload: PropTypes.func.isRequired,
};

export default FileInput;
