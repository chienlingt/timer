import PropTypes from "prop-types";
import SelectInput from "./SelectInput";
import TextInput from "./TextInput";
import NamePreview from "./NamePreview";

const NameInput = ({ 双人环节, 环节名称, set环节名称 }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    set环节名称({ ...环节名称, [name]: value });
  };

  const 持方Options = ["正方", "反方"];
  const 辩位Options = ["一辩", "二辩", "三辩", "四辩", "双方"];

  const isComplete =
    双人环节 === "否"
      ? 环节名称.持方 && 环节名称.间隔 && 环节名称.辩位 && 环节名称.环节
      : 环节名称.辩位 && 环节名称.环节;

  return (
    <div className="mb-4">
      <label className="block text-gray-700">环节名称</label>
      <div className="flex">
        {双人环节 === "否" && (
          <>
            <SelectInput
              value={环节名称.持方}
              onChange={handleChange}
              name="持方"
              options={持方Options}
              className="w-full"
            />
            <TextInput
              value={环节名称.间隔}
              onChange={handleChange}
              name="间隔"
              placeholder="间隔"
              maxLength={3}
              className="w-full"
            />
          </>
        )}
        <SelectInput
          value={环节名称.辩位}
          onChange={handleChange}
          name="辩位"
          options={辩位Options}
          className="w-full"
        />
        <TextInput
          value={环节名称.环节}
          onChange={handleChange}
          name="环节"
          placeholder="环节"
          className="w-full"
        />
      </div>
      {isComplete ? (
        <NamePreview 双人环节={双人环节} 环节名称={环节名称} />
      ) : (
        <p className="mt-2 text-red-500">请填写完整环节名称以预览效果</p>
      )}
    </div>
  );
};

NameInput.propTypes = {
  双人环节: PropTypes.string.isRequired,
  环节名称: PropTypes.object.isRequired,
  set环节名称: PropTypes.func.isRequired,
};

export default NameInput;
