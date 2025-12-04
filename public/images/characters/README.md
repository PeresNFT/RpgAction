# Imagens de Personagens

Coloque as imagens dos personagens nesta pasta.

## Nomenclatura

As imagens devem seguir os seguintes nomes (baseados na classe do personagem e gênero):

### Versões Masculinas:
- `Guerreiro.png` - Para a classe Guerreiro (warrior) masculino
- `Arqueiro.png` - Para a classe Arqueiro (archer) masculino
- `Mago.png` - Para a classe Mago (mage) masculino

### Versões Femininas:
- `Guerreira.png` - Para a classe Guerreiro (warrior) feminino
- `Arqueira.png` - Para a classe Arqueiro (archer) feminino
- `Maga.png` - Para a classe Mago (mage) feminino

## Funcionalidade

- **Alternância**: Clique na imagem do personagem para alternar entre versão masculina e feminina
- **Persistência**: A preferência é salva no localStorage do navegador
- **Aplicação**: A versão escolhida aparece na sidebar e na arena de batalha

## Formato Recomendado

- **Formato**: PNG (com transparência) ou JPG
- **Tamanho**: 200x200px a 400x400px (será redimensionado automaticamente)
- **Background**: Transparente (preferencial) ou fundo escuro
- **Formato**: Quadrado ou circular (será exibido como circular na sidebar)

## Fallback

Se uma imagem não for encontrada, o sistema usará o ícone emoji da classe como fallback:
- Guerreiro: ⚔️
- Arqueiro: 🏹
- Mago: 🔮

