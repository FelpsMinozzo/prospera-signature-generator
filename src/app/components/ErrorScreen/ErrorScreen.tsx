import styles from "../../styles/Preview.module.css";

interface Props {
  error: string;
  onBack: () => void;
}

export default function ErrorScreen({ error, onBack }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.error}>
        <h2>Erro</h2>
        <p>{error}</p>
        <button onClick={onBack} className={styles.newButton}>
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}
