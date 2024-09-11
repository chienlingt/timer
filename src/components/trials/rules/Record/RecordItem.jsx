import PropTypes from "prop-types";
import { useDrag, useDrop } from "react-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { formatSecondsToMinutesAndSeconds } from "../TimeConversion";
import { motion } from "framer-motion";

const ItemType = "RECORD";

const RecordItem = ({ record, index, moveRecord }) => {
  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveRecord(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <motion.div
      ref={(node) => drag(drop(node))}
      className={`p-6 mb-2 bg-gray-100 rounded flex items-center hover:shadow-lg transition ${
        isDragging ? "opacity-50" : ""
      }`}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <FontAwesomeIcon icon={faBars} className="mr-5 cursor-pointer" />
      <div>
        <p className="text-2xl font-bold">{record.环节名称}</p>
        <p className="text-lg">
          {formatSecondsToMinutesAndSeconds(record.环节用时)}
          <span className="text-sm ml-4">环节 {index + 1}</span>
        </p>
      </div>
    </motion.div>
  );
};

RecordItem.propTypes = {
  record: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  moveRecord: PropTypes.func.isRequired,
};

export default RecordItem;
