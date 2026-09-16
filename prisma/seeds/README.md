# Como “compilar/rodar” os seeds

## Opcao A: rodar direto com ts-node

O projeto ja tem `ts-node` instalado nas dependencias de desenvolvimento. Na raiz do projeto, rode:

```bash
npx ts-node prisma/seeds/seed.ts
```

Isso popula a base pedagogica inicial:

- Area
- Discipline
- Competency
- Skill
- KnowledgeObject

Depois confira:

```bash
npx prisma studio
```

## Opção B (padrão Prisma): prisma db seed

Se quiser usar `npx prisma db seed`, adicione ao `package.json`:

```json
"prisma": {
  "seed": "ts-node prisma/seeds/seed.ts"
}
```

Depois rode:

```bash
npx prisma db seed
```

# Ordem correta de popular (no seu caso)

Com os seeds atuais, comece pela base fixa:

- Area
- Discipline
- Competency
- Skill
- KnowledgeObject

Depois disso, a evolucao natural da base e:

- Exam / Question / Blocks / Alternatives (seus JSONs)
- InepItemMicrodata (microdados TRI)
- Relacionamentos (QuestionSkill etc.)
- Usuário/simulado/attempt
- IA + validação humana
