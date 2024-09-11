import PropTypes from "prop-types";

const SelectInput = ({ value, onChange, name, options, className }) => (
  <select
    className={`px-3 py-2 border rounded mb-2 mx-2 ${className}`}
    value={value}
    onChange={onChange}
    name={name}
  >
    <option value="">选择{name}...</option>
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

SelectInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
};

SelectInput.defaultProps = {
  className: "",
};

export default SelectInput;
