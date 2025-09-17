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

interface FormData {
  nome: string;
  telefone: string;
  email: string;
}

interface SignatureData extends FormData {
  signatureUrl: string;
}

export default function Preview() {
  const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [generatingSignature, setGeneratingSignature] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const formDataStr = localStorage.getItem('formData');
    if (!formDataStr) {
      router.push('/');
      return;
    }

    try {
      const formData: FormData = JSON.parse(formDataStr);
      generateSignature(formData);
    } catch {
      setError('Erro ao carregar dados do formulário.');
      setLoading(false);
    }
  }, [router]);

  const generateSignature = async (formData: FormData) => {
    setGeneratingSignature(true);
    
    try {
      // Chama API para gerar assinatura
      const response = await fetch("/api/generate-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar assinatura");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Cria o objeto completo com a assinatura
      const signatureDataComplete: SignatureData = {
        ...formData,
        signatureUrl: url,
      };

      // Salva dados completos + assinatura
      localStorage.setItem("signatureData", JSON.stringify(signatureDataComplete));
      
      setSignatureData(signatureDataComplete);
    } catch (error) {
      console.error("Erro:", error);
      setError("Erro ao gerar assinatura. Tente novamente.");
    } finally {
      setGeneratingSignature(false);
      setLoading(false);
    }
  };

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
    // Limpa todos os dados armazenados
    localStorage.removeItem('signatureData');
    localStorage.removeItem('formData');
    
    // Libera a URL do blob se existir
    if (signatureData?.signatureUrl) {
      URL.revokeObjectURL(signatureData.signatureUrl);
    }
    
    router.push('/');
  };

  const handleRegenerateSignature = async () => {
    if (!signatureData) return;
    
    // Libera a URL atual
    if (signatureData.signatureUrl) {
      URL.revokeObjectURL(signatureData.signatureUrl);
    }
    
    const formData: FormData = {
      nome: signatureData.nome,
      telefone: signatureData.telefone,
      email: signatureData.email
    };
    
    await generateSignature(formData);
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
          <h1 className={styles.title}>
            {generatingSignature ? 'Gerando sua Assinatura...' : 'Preview da sua Assinatura'}
          </h1>
          
          {generatingSignature ? (
            <div className={styles.generatingSection}>
              <div className={styles.loadingSpinner}></div>
              <p>Por favor, aguarde enquanto geramos sua assinatura personalizada...</p>
            </div>
          ) : (
            <>
              <div className={styles.previewSection}>
                <SignaturePreview url={signatureData?.signatureUrl ?? ''} />
              </div>
              
              <SignatureActions
                onDownload={handleDownload}
                onNew={handleNewSignature}
                disabled={!signatureData?.signatureUrl}
              />
              
              {signatureData && <SignatureDataInfo data={signatureData} />}
            </>
          )}
        </main>
      </div>
    </>
  );
}