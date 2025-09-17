// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from "next/navigation";
// import Head from 'next/head';
// import styles from './styles/Form.module.css';
// import { 
//   InputField,
//   SubmitButton
// } from './components';

// interface FormData {
//   nome: string;
//   telefone: string;
//   email: string;
// }

// interface ValidationResponse {
//   valid: boolean;
//   message: string;
//   suggestions?: string[];
// }

// const allowedDomains = ["meuprospera.com.br"];

// export default function Home() {
//   const [formData, setFormData] = useState<FormData>({
//     nome: '',
//     telefone: '',
//     email: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState<Partial<FormData>>({});
//   const [emailValidation, setEmailValidation] = useState<ValidationResponse | null>(null);
//   const [emailTouched, setEmailTouched] = useState(false); // controla se o usuário já digitou

//   const router = useRouter();

//   // useEffect para validar o email sempre que mudar
//   useEffect(() => {
//     if (!emailTouched) return; // só valida se o usuário já mexeu no campo

//     if (!formData.email) {
//       setEmailValidation({
//         valid: false,
//         message: "E-mail é obrigatório",
//       });
//       return;
//     }

//     const trimmed = formData.email.trim();
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     if (!emailRegex.test(trimmed)) {
//       setEmailValidation({
//         valid: false,
//         message: "Formato de e-mail inválido",
//       });
//       return;
//     }

//     const [localPart, domain] = trimmed.split("@");

//     if (!allowedDomains.includes(domain)) {
//       setEmailValidation({
//         valid: false,
//         message: "Domínio de e-mail não permitido",
//         suggestions: allowedDomains.map((d) => `${localPart}@${d}`),
//       });
//       return;
//     }

//     setEmailValidation({
//       valid: true,
//       message: "E-mail válido",
//     });
//   }, [formData.email, emailTouched]);

//   // Função para formatar o telefone
//   const formatPhone = (value: string): string => {
//     const digits = value.replace(/\D/g, "");
//     if (digits.length <= 2) {
//       return `(${digits}`;
//     } else if (digits.length <= 6) {
//       return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
//     } else if (digits.length <= 10) {
//       return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
//     } else {
//       return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;

//     let formattedValue = value;

//     if (name === "telefone") {
//       formattedValue = formatPhone(value);
//     }

//     if (name === "email" && !emailTouched) {
//       setEmailTouched(true); // marca que o usuário começou a digitar no email
//     }

//     setFormData(prev => ({
//       ...prev,
//       [name]: formattedValue
//     }));

//     if (errors[name as keyof FormData]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: undefined
//       }));
//     }
//   };

//   const validateForm = (): boolean => {
//     const newErrors: Partial<FormData> = {};

//     if (!formData.nome.trim()) {
//       newErrors.nome = 'Nome é obrigatório';
//     }

//     if (!formData.email.trim()) {
//       newErrors.email = 'E-mail é obrigatório';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0 && emailValidation?.valid === true;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
  
//     if (!validateForm()) return;
  
//     setLoading(true);
  
//     try {
//       // Chama API para gerar assinatura
//       const response = await fetch("/api/generate-signature", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });
  
//       if (!response.ok) {
//         throw new Error("Erro ao gerar assinatura");
//       }
  
//       const blob = await response.blob();
//       const url = URL.createObjectURL(blob);
  
//       // Salva dados + assinatura
//       localStorage.setItem(
//         "signatureData",
//         JSON.stringify({
//           ...formData,
//           signatureUrl: url,
//         })
//       );
  
//       router.push("/preview");
//     } catch (error) {
//       console.error("Erro:", error);
//       alert("Erro ao gerar assinatura. Tente novamente.");
//     } finally {
//       setLoading(false);
//     }
//   };
  

//   return (
//     <>
//       <Head>
//         <title>Gerador de Assinatura de E-mail</title>
//         <meta name="description" content="Crie sua assinatura de e-mail personalizada" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>

//       <div className={styles.container}>
//         <main className={styles.main}>
//           <h1 className={styles.title}>
//             Gerador de Assinatura de E-mail
//           </h1>

//           <p className={styles.description}>
//             Preencha os dados abaixo para gerar sua assinatura personalizada
//           </p>

//           <form className={styles.form} onSubmit={handleSubmit}>
//           <InputField
//               id="nome"
//               name="nome"
//               label="Nome *"
//               value={formData.nome}
//               onChange={handleChange}
//               placeholder="Digite seu Nome e Sobrenome"
//               error={errors.nome}
//             />

//             <InputField
//               id="telefone"
//               name="telefone"
//               label="Telefone"
//               type="tel"
//               value={formData.telefone}
//               onChange={handleChange}
//               placeholder="(99) 99999-9999"
//               maxLength={15}
//             />

//             <InputField
//               id="email"
//               name="email"
//               label="E-mail *"
//               type="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="seuemail@meuprospera.com.br"
//               error={errors.email || (emailTouched && !emailValidation?.valid ? emailValidation?.message : undefined)}
//             />

//             <SubmitButton loading={loading} disabled={!emailValidation?.valid}>
//             Enviar
//             </SubmitButton>
          
//           </form>
//         </main>
//       </div>
//     </>
//   );
// }


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import Head from 'next/head';
import styles from './styles/Form.module.css';
import { 
  InputField,
  SubmitButton
} from './components';

interface FormData {
  nome: string;
  telefone: string;
  email: string;
}

interface ValidationResponse {
  valid: boolean;
  message: string;
  suggestions?: string[];
}

const allowedDomains = ["meuprospera.com.br"];

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    telefone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [emailValidation, setEmailValidation] = useState<ValidationResponse | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);

  const router = useRouter();

  // useEffect para validar o email sempre que mudar
  useEffect(() => {
    if (!emailTouched) return;

    if (!formData.email) {
      setEmailValidation({
        valid: false,
        message: "E-mail é obrigatório",
      });
      return;
    }

    const trimmed = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
      setEmailValidation({
        valid: false,
        message: "Formato de e-mail inválido",
      });
      return;
    }

    const [localPart, domain] = trimmed.split("@");

    if (!allowedDomains.includes(domain)) {
      setEmailValidation({
        valid: false,
        message: "Domínio de e-mail não permitido",
        suggestions: allowedDomains.map((d) => `${localPart}@${d}`),
      });
      return;
    }

    setEmailValidation({
      valid: true,
      message: "E-mail válido",
    });
  }, [formData.email, emailTouched]);

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  
  if (digits.length === 0) {
    return "";
  }
  
  if (digits.length === 1) {
    return `(${digits}`;
  } else if (digits.length === 2) {
    return `(${digits}`;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  } else if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  } else {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let formattedValue = value;

    if (name === "telefone") {
      formattedValue = formatPhone(value);
    }

    if (name === "email" && !emailTouched) {
      setEmailTouched(true);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && emailValidation?.valid === true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    setLoading(true);
  
    try {
      // Salva apenas os dados do formulário
      localStorage.setItem("formData", JSON.stringify(formData));
      
      // Redireciona para preview que irá gerar a assinatura
      router.push("/preview");
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao processar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Gerador de Assinatura de E-mail</title>
        <meta name="description" content="Crie sua assinatura de e-mail personalizada" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>
            Gerador de Assinatura de E-mail
          </h1>

          <p className={styles.description}>
            Preencha os dados abaixo para gerar sua assinatura personalizada
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
          <InputField
              id="nome"
              name="nome"
              label="Nome *"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Digite seu Nome e Sobrenome"
              error={errors.nome}
            />

            <InputField
              id="telefone"
              name="telefone"
              label="Telefone"
              type="tel"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(99) 99999-9999"
              maxLength={15}
            />

            <InputField
              id="email"
              name="email"
              label="E-mail *"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seuemail@meuprospera.com.br"
              error={errors.email || (emailTouched && !emailValidation?.valid ? emailValidation?.message : undefined)}
            />

            <SubmitButton loading={loading} disabled={!emailValidation?.valid}>
            Gerar Assinatura
            </SubmitButton>
          
          </form>
        </main>
      </div>
    </>
  );
}