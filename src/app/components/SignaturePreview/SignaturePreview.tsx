import Image from "next/image";
import styles from "../../styles/Preview.module.css";

export default function SignaturePreview({ url }: { url: string }) {
  if (!url) {
    return <div className={styles.error}>Erro ao carregar preview da assinatura</div>;
  }
  
  return (
    <div className={styles.signaturePreview}>
      <Image 
        src={url} 
        alt="Preview da assinatura" 
        className={styles.signatureImage}
        width={500}
        height={200}
        style={{ width: 'auto', height: 'auto' }}
      />
    </div>
  );
}