import styles from "../../styles/Preview.module.css";

interface Props {
  onDownload: () => void;
  onNew: () => void;
  disabled: boolean;
}

export default function SignatureActions({ onDownload, onNew, disabled }: Props) {
  return (
    <>
      <div className={styles.actions}>
        <button onClick={onDownload} className={styles.downloadButton} disabled={disabled}>
          Download da Assinatura
        </button>
      </div>

      <div className={styles.navigationActions}>
        <button onClick={onNew} className={styles.newButton}>
          Nova Assinatura
        </button>
      </div>
    </>
  );
}
