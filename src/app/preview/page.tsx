'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import styles from '../styles/Preview.module.css';
import {
  LoadingScreen,
  ErrorScreen,
  SignaturePreview,
  SignatureActions,
  SignatureDataInfo
} from '../components';

interface SignatureData {
  nome: string;
  telefone: string;
  email: string;
  signatureUrl: string;
}

export default function Preview() {
  const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const data = localStorage.getItem('signatureData');
    if (!data) {
      router.push('/');
      return;
    }

    try {
      const parsed = JSON.parse(data);
      setSignatureData(parsed);
    } catch {
      setError('Erro ao carregar dados da assinatura.');
    }
    setLoading(false);
  }, [router]);

  const handleDownload = () => {
    if (!signatureData?.signatureUrl) return;
    
    const link = document.createElement('a');
    link.href = signatureData.signatureUrl;
    link.download = `assinatura-${signatureData.nome.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNewSignature = () => {
    localStorage.removeItem('signatureData');
    router.push('/');
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onBack={handleNewSignature} />;

  return (
    <>
      <Head>
        <title>Preview da Assinatura</title>
        <meta name="description" content="Visualize e baixe sua assinatura personalizada" />
      </Head>
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Preview da sua Assinatura</h1>
          <div className={styles.previewSection}>
            <SignaturePreview url={signatureData?.signatureUrl ?? ''} />
          </div>
          <SignatureActions
            onDownload={handleDownload}
            onNew={handleNewSignature}
            disabled={!signatureData?.signatureUrl}
          />
          {signatureData && <SignatureDataInfo data={signatureData} />}
        </main>
      </div>
    </>
  );
}