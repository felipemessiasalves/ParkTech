# Funcionalidades do MVP — Sistema de Gestão de Estacionamento

Documento de referência com as principais funcionalidades definidas para o MVP, com breve descrição e regras essenciais de cada uma.

---

## 1. Controle de Entrada e Saída de Veículos

Registra o ciclo completo de permanência de cada veículo no estacionamento, da entrada até a saída.

- Toda entrada gera um registro único com placa, data/hora e operador responsável.
- Não é permitido haver duas entradas ativas para a mesma placa ao mesmo tempo.
- Na saída, o sistema calcula automaticamente o tempo total de permanência.
- Veículos "no estacionamento" ficam visíveis em uma lista de acompanhamento, mesmo antes do pagamento.
- Toda ação (entrada, saída, liberação sem cobrança) registra quem executou e quando, formando um histórico não editável.

---

## 2. Cadastro das Configurações de Valor por Hora e Regras

Permite ao administrador definir e manter a tabela de tarifas, sem depender de cálculo manual ou valores fixos no sistema.

- Cadastro do valor da primeira hora (ou fração inicial) e do valor de horas adicionais.
- Definição da regra de fração (cobrança por período fixo de minutos ou arredondamento por hora cheia).
- Alterações de tarifa possuem data de vigência, preservando o valor correto para veículos já estacionados.
- O valor a pagar é sempre calculado automaticamente pelo sistema (tempo × tarifa vigente) — não pode ser digitado manualmente pelo operador.
- Descontos ou isenções exigem ação explícita, com motivo registrado e restrita ao administrador.

---

## 3. Dashboard com Indicadores

Tela de visão geral para acompanhamento rápido da operação, com dados essenciais em tempo real.

- Quantidade de veículos atualmente no estacionamento.
- Faturamento do dia (ou do período selecionado).
- Quantidade de veículos que já saíram no dia.
- Filtro simples por período (hoje, últimos 7 dias, mês atual).
- Indicadores exibidos refletem exatamente os registros de entrada/saída/pagamento, sem cálculo paralelo.
- Visão adaptada por perfil: administrador vê dados financeiros completos; operador vê apenas dados operacionais.

---

## 4. Controle de Usuários (Operador x Administrador)

Garante que cada pessoa tenha acesso individual e permissões compatíveis com sua função, sustentando a rastreabilidade de todo o sistema.

- Login individual obrigatório — sem usuários genéricos ou compartilhados.
- Dois perfis: **Operador** (registra entrada/saída e confirma pagamento) e **Administrador** (acesso total, incluindo tarifas, descontos, usuários e relatórios financeiros).
- Apenas o administrador pode criar, editar ou desativar usuários.
- Ao desativar um usuário, seu histórico de ações é preservado — apenas o acesso é bloqueado.
- Ações sensíveis (desconto, liberação sem cobrança, alteração de tarifa) sempre registram o usuário responsável.

---

### Ordem de implementação sugerida

1. Controle de Usuários — base de segurança e rastreabilidade para todo o resto.
2. Controle de Entrada e Saída de Veículos.
3. Cadastro de Configurações de Valor por Hora e Regras.
4. Dashboard com Indicadores.
