import styles from './InputField.module.css';

interface InputFieldProps {
    id: string;
    name: string;
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: string;
    maxLength?: number;
  }
  
  export default function InputField({
    id,
    name,
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    error,
    maxLength
  }: InputFieldProps) {
    return (
      <div className={styles.inputGroup}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`${styles.input} ${error ? styles.inputError : ""}`}
        />
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  }
  