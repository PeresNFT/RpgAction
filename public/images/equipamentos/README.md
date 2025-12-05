# Equipamentos - Imagens

Este diretório contém as imagens dos equipamentos do jogo.

## Estrutura de Nomenclatura

As imagens devem seguir o padrão: `{material}_{tipo}.png`

### Set de Bronze (Guerreiro)
- `copper_helmet.png` - Elmo de Bronze
- `copper_armor.png` - Armadura de Bronze
- `copper_sword.png` - Espada de Bronze
- `copper_boots.png` - Bota de Bronze
- `copper_shield.png` - Escudo de Bronze
- `copper_ring.png` - Anel de Bronze
- `copper_amulet.png` - Amuleto de Bronze

### Set de Pano (Mago)
- `cloth_helmet.png` - Elmo de Pano
- `cloth_armor.png` - Armadura de Pano
- `cloth_staff.png` - Cajado de Pano
- `cloth_boots.png` - Bota de Pano
- `cloth_bible.png` - Bíblia de Pano
- `cloth_ring.png` - Anel de Pano
- `cloth_amulet.png` - Amuleto de Pano

### Set de Couro (Arqueiro)
- `leather_helmet.png` - Elmo de Couro
- `leather_armor_set.png` - Armadura de Couro
- `leather_bow.png` - Arco de Couro
- `leather_boots.png` - Bota de Couro
- `leather_ring.png` - Anel de Couro
- `leather_amulet.png` - Amuleto de Couro

### Relíquia (Todas as Classes)
- `relic_ancient.png` - Relíquia Antiga (Dropa de monstros nível 10, +5 em todos os stats)

## Formato Recomendado

- **Formato**: PNG com transparência
- **Tamanho**: 64x64 pixels (ou múltiplos de 64)
- **Estilo**: Consistente com o tema do jogo
- **Background**: Transparente

## Notas

- As imagens são usadas como fallback quando o `imagePath` está definido no item
- Se a imagem não existir, o sistema usa o ícone emoji como fallback
- Todos os itens do set inicial (níveis 1-10) devem ter imagens correspondentes

