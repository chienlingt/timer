import PropTypes from "prop-types";

const DualPersonInput = ({ value, onChange }) => {
  const values = ["是", "否"];
  return (
    <div className="mb-4">
      <label className="block text-gray-700">双人环节</label>
      <div className="flex">
        {values.map((val) => (
          <label className="mr-4" key={val}>
            <input
              type="radio"
              value={val}
              checked={value === val}
              onChange={onChange}
              className="mr-1"
            />
            {val}
          </label>
        ))}
      </div>
    </div>
  );
};

DualPersonInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default DualPersonInput;
