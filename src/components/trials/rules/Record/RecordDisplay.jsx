import PropTypes from "prop-types";
import RecordItem from "./RecordItem";
import { AnimatePresence } from "framer-motion";

const RecordDisplay = ({ records, moveRecord }) => (
  <div className="mt-4 max-h-96 overflow-y-auto">
    <AnimatePresence>
      {records.map((record, index) => (
        <RecordItem
          key={index}
          record={record}
          index={index}
          moveRecord={moveRecord}
        />
      ))}
    </AnimatePresence>
  </div>
);

RecordDisplay.propTypes = {
  records: PropTypes.arrayOf(PropTypes.object).isRequired,
  moveRecord: PropTypes.func.isRequired,
};

export default RecordDisplay;
