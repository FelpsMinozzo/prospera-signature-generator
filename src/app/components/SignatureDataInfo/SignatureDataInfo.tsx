import styles from "../../styles/Preview.module.css";

interface SignatureData {
  nome: string;
  telefone: string;
  email: string;
}

export default function SignatureDataInfo({ data }: { data: SignatureData }) {
  return (
    <div className={styles.dataInfo}>
      <h3>Dados da Assinatura:</h3>
      <p>
        <strong>Nome:</strong> {data.nome}
      </p>
      <p>
        <strong>E-mail:</strong> {data.email}
      </p>
      {data.telefone && (
        <p>
          <strong>Telefone:</strong> {data.telefone}
        </p>
      )}
    </div>
  );
}
