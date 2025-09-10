import styles from "./SubmitButton.module.css";

interface SubmitButtonProps {
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export default function SubmitButton({
  loading,
  disabled,
  children,
}: SubmitButtonProps) {
  return (
    <button
      className={styles.button}
      disabled={disabled || loading}
      type="submit"
    >
      {children}
      {loading && <span className={styles.spinner}></span>}
    </button>
  );
}
