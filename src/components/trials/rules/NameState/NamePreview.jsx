import PropTypes from "prop-types";

const NamePreview = ({ 双人环节, 环节名称 }) => (
  <div className="mt-2 px-5 py-2 border rounded-lg bg-slate-200">
    <p className="text-sm">预览</p>
    <p className="mt-2 mb-7 text-center text-5xl font-bold">
      {双人环节 === "否" && 环节名称.持方}
      {环节名称.辩位}
      {双人环节 === "否" && 环节名称.间隔}
      {环节名称.环节}
    </p>
  </div>
);

NamePreview.propTypes = {
  双人环节: PropTypes.string.isRequired,
  环节名称: PropTypes.object.isRequired,
};

export default NamePreview;
