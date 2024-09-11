import PropTypes from "prop-types";

const BaseNumberInput = ({ label, name, value, onChange }) => (
  <div className="mb-4">
    <label className="block mb-2">{label}</label>
    <input
      type="number"
      name={name}
      value={value}
      onChange={onChange}
      className="input w-full"
    />
  </div>
);

BaseNumberInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default BaseNumberInput;
