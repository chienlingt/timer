import PropTypes from "prop-types";

// TimeSelect 让用户选择常见时间
// 因为在辩论赛里面，每个环节的时间普遍都是 2/2.5/3/4 分钟
// 所以使用下拉菜单会更方便

const TimeSelect = ({ value, handleChange }) => (
  <div className="flex mt-2">
    <select
      className="w-full px-3 py-2 border rounded"
      value={value || ""}
      onChange={handleChange}
      name="环节用时"
    >
      <option value="">选择常见时间...</option>
      <option value="2分钟">2分钟</option>
      <option value="2分钟30秒">2分钟30秒</option>
      <option value="3分钟">3分钟</option>
      <option value="4分钟">4分钟</option>
    </select>
  </div>
);

TimeSelect.propTypes = {
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default TimeSelect;
