import ComingSoon from "../../components/ComingSoon";

export default function CadernoDeErros() {
  return (
    <ComingSoon
      titulo="Caderno de Erros"
      descricao="Em breve, todo exercício errado fica guardado automaticamente aqui, organizado por matéria, pronto a rever antes do exame."
      icon={<><circle cx="12" cy="12" r="9" /><path d="M9.1 9a3 3 0 015.8 1c0 2-3 2-3 4" /><path d="M12 17h.01" /></>}
    />
  );
}
