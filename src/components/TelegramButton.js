import { faMessage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function TelegramButton({}) {
  return (
    <div style={{ position: "absolute" }}>
      <button>
        <FontAwesomeIcon icon={faMessage} />
      </button>
    </div>
  );
}
