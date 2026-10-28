// Espera o HTML carregar antes de executar o código
document.addEventListener("DOMContentLoaded", function () {

    // Busca os campos de endereço pelo ID
    const campoCep = document.querySelector("#cep");
    const campoRua = document.querySelector("#rua");
    const campoBairro = document.querySelector("#bairro");
    const campoCidade = document.querySelector("#cidade");
    const campoEstado = document.querySelector("#estado");

    // Busca o formulário e os espaços para mensagens
    const formulario = document.querySelector("#formContato");
    const mensagemCep = document.querySelector("#mensagemCep");
    const mensagemFormulario =
        document.querySelector("#mensagemFormulario");

    // Guarda se o último CEP consultado foi encontrado
    let cepEncontrado = "";

    // Confere se os elementos principais existem
    if (!campoCep || !formulario) {
        console.error("Campo CEP ou formulário não encontrado.");
        return;
    }

    // Mostra uma mensagem sobre a consulta de CEP
    function mostrarMensagemCep(texto, cor) {
        mensagemCep.textContent = texto;
        mensagemCep.style.color = cor;
    }

    // Limpa os campos de endereço
    function limparEndereco() {
        campoRua.value = "";
        campoBairro.value = "";
        campoCidade.value = "";
        campoEstado.value = "";
        cepEncontrado = "";
    }

    // Consulta o endereço usando a API ViaCEP
    async function consultarCep() {

        // Remove traços, espaços e outros caracteres
        const cep = campoCep.value.replace(/\D/g, "");

        // Limpa a mensagem anterior
        mensagemCep.textContent = "";

        // Verifica se o CEP possui oito números
        if (cep.length !== 8) {
            limparEndereco();
            mostrarMensagemCep(
                "Digite um CEP válido com 8 números.",
                "red"
            );
            return false;
        }

        // Evita uma consulta repetida para o mesmo CEP
        if (cep === cepEncontrado) {
            return true;
        }

        mostrarMensagemCep("Consultando CEP...", "#a76500");

        try {
            // Faz a requisição para a API ViaCEP
            const resposta = await fetch(
                `https://viacep.com.br/ws/${cep}/json/`
            );

            // Verifica se a requisição foi respondida
            if (!resposta.ok) {
                throw new Error("Erro na consulta do CEP.");
            }

            // Converte a resposta para objeto JavaScript
            const dados = await resposta.json();

            // Verifica se a API não encontrou o CEP
            if (dados.erro) {
                limparEndereco();
                mostrarMensagemCep(
                    "CEP não encontrado. Confira os números.",
                    "red"
                );
                return false;
            }

            // Preenche os campos com os dados retornados
            campoRua.value = dados.logradouro || "";
            campoBairro.value = dados.bairro || "";
            campoCidade.value = dados.localidade || "";
            campoEstado.value = dados.uf || "";

            // Registra qual CEP foi consultado com sucesso
            cepEncontrado = cep;

            mostrarMensagemCep(
                "Endereço encontrado com sucesso!",
                "green"
            );

            return true;

        } catch (erro) {
            // Trata falhas de conexão ou da API
            limparEndereco();

            mostrarMensagemCep(
                "Não foi possível consultar o CEP. Tente novamente.",
                "red"
            );

            console.error("Erro ao consultar CEP:", erro);

            return false;
        }
    }

    // Consulta quando o usuário sai do campo CEP
    campoCep.addEventListener("blur", consultarCep);

    // Permite consultar o CEP ao pressionar Enter no campo
    campoCep.addEventListener("keydown", function (evento) {
        if (evento.key === "Enter") {
            evento.preventDefault();
            consultarCep();
        }
    });

    // Se o CEP for alterado, exige uma nova consulta
    campoCep.addEventListener("input", function () {
        const cepAtual = campoCep.value.replace(/\D/g, "");

        if (cepAtual !== cepEncontrado) {
            limparEndereco();
            mensagemCep.textContent = "";
        }

        // Aplica a máscara 00000-000 enquanto digita
        let numeros = campoCep.value.replace(/\D/g, "");

        if (numeros.length > 5) {
            numeros =
                numeros.substring(0, 5) + "-" +
                numeros.substring(5, 8);
        }

        campoCep.value = numeros;
    });

    // Valida o formulário quando o usuário tenta enviar
    formulario.addEventListener("submit", async function (evento) {

        // Impede o envio tradicional e o recarregamento da página
        evento.preventDefault();

        // Limpa a mensagem anterior
        mensagemFormulario.textContent = "";
        mensagemFormulario.style.color = "";

        // Verifica os campos obrigatórios do HTML
        if (!formulario.checkValidity()) {
            formulario.reportValidity();
            return;
        }

        // Confirma que o CEP foi consultado com sucesso
        const cepValido = await consultarCep();

        if (!cepValido) {
            campoCep.focus();
            return;
        }

        // Exibe a confirmação do preenchimento
        mensagemFormulario.textContent =
            "Formulário preenchido com sucesso!";

        mensagemFormulario.style.color = "green";

        // Limpa os campos após a confirmação
        formulario.reset();
        limparEndereco();
    });

});