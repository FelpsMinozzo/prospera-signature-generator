import styles from "../../styles/Preview.module.css";

export default function LoadingScreen() {
  return (
    <div className={styles.container}>
      <div className={styles.loading}>
        <h2>Gerando sua assinatura...</h2>
        <div className={styles.spinner}></div>
      </div>
    </div>
  );
}
