---
name: visual-identity-audit
description: Audita e refatora a interface do aplicativo Vue/Ionic para alinhar fortemente a identidade visual e o fluxo às imagens de referência em docs/midias de flow, preservando adaptações funcionais do projeto.
---

# Visual Identity & Flow Audit

Você deve revisar e corrigir a interface do aplicativo usando as imagens em `docs/midias de flow/` como fonte principal de identidade visual e referência de experiência, respeitando as decisões documentadas em `docs/decisoes.md` (se existir).

## Etapa 1: Extração da Identidade Visual (obrigatória antes de editar código)
Inspecione todas as imagens em `docs/midias de flow/` e sintetize um **Guia de Identidade Visual** contendo:
1. **Paleta de Cores:** Cores de fundo (primário, secundário, superfície de cards), cores de destaque/ação (CTAs), cores de texto (primário, secundário, sutil), bordas e estados (selecionado, ativo, desabilitado).
2. **Superfícies e Formas:** Raio de borda (`border-radius`) de cards, botões e inputs; uso de sombras, gradientes, transparências/glassmorphism ou bordas finas.
3. **Tipografia e Hierarquia:** Peso, contraste e escala entre títulos, subtítulos, perguntas, opções selecionáveis e microtextos.
4. **Atmosfera e Espaçamento:** Densidade visual (respiro entre elementos, paddings internos, alinhamento) e estilo de ícones/ilustrações.
5. **Fluxo das Telas:** Mapeie a sequência lógica das imagens (ex.: onboarding/check-in diário, seleção de respostas, transição, tela de recomendação/resultado).

## Etapa 2: Diagnóstico do Código Atual vs. Referências
Compare cada tela/componente atual do front-end (Vue + Ionic) com o Guia de Identidade Visual extraído:
- Liste onde a identidade visual está "genérica" ou distante das fotos (cores lavadas, botões padrão do Ionic sem estilização, falta de hierarquia, espaçamento apertado, cards sem personalidade).
- Identifique o que deve ser **adaptado** (e não copiado cegamente): textos reais do app, responsividade mobile (`safe-area`, telas pequenas), acessibilidade/contraste e interações nativas do Ionic.

## Etapa 3: Implementação Consistente
1. Centralize primeiro os tokens visuais (variáveis CSS / tema do Ionic / classes utilitárias) para que toda a aplicação respire a mesma identidade visual.
2. Refatore as telas e componentes seguindo o fluxo das imagens, garantindo que:
   - Os elementos de identidade visual das fotos sejam imediatamente reconhecíveis (cores, formas, destaque da opção selecionada, estilo dos cards e botões).
   - As adaptações funcionais do aplicativo sejam preservadas sem quebrar regras de negócio ou chamadas de API.
3. Ao final, apresente um resumo objetivo do que foi alterado por tela e quais adaptações foram feitas em relação às imagens.