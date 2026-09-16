import { prisma } from './_prisma';
import type { AreaCode } from '@prisma/client';

type SkillSeed = { code: string; description: string };
type CompetencySeed = {
  code: number;
  description: string;
  skills: SkillSeed[];
};

const MATRIX: Record<AreaCode, CompetencySeed[]> = {
  LC: [
    {
      code: 1,
      description:
        'Aplicar as tecnologias da comunicação e da informação na escola, no trabalho e em outros contextos relevantes para sua vida.',
      skills: [
        {
          code: 'H1',
          description:
            'Identificar as diferentes linguagens e seus recursos expressivos como elementos de caracterização dos sistemas de comunicação.',
        },
        {
          code: 'H2',
          description:
            'Recorrer aos conhecimentos sobre as linguagens dos sistemas de comunicação e informação para resolver problemas sociais.',
        },
        {
          code: 'H3',
          description:
            'Relacionar informações geradas nos sistemas de comunicação e informação, considerando a função social desses sistemas.',
        },
        {
          code: 'H4',
          description:
            'Reconhecer posições críticas aos usos sociais que são feitos das linguagens e dos sistemas de comunicação e informação.',
        },
      ],
    },
    {
      code: 2,
      description:
        'Conhecer e usar língua(s) estrangeira(s) moderna(s) como instrumento de acesso a informações e a outras culturas e grupos sociais*.',
      skills: [
        {
          code: 'H5',
          description:
            'Associar vocábulos e expressões de um texto em LEM ao seu tema.',
        },
        {
          code: 'H6',
          description:
            'Utilizar os conhecimentos da LEM e de seus mecanismos como meio de ampliar as possibilidades de acesso a informações, tecnologias e culturas.',
        },
        {
          code: 'H7',
          description:
            'Relacionar um texto em LEM, as estruturas linguísticas, sua função e seu uso social.',
        },
        {
          code: 'H8',
          description:
            'Reconhecer a importância da produção cultural em LEM como representação da diversidade cultural e linguística.',
        },
      ],
    },
    {
      code: 3,
      description:
        'Compreender e usar a linguagem corporal como relevante para a própria vida, integradora social e formadora da identidade.',
      skills: [
        {
          code: 'H9',
          description:
            'Reconhecer as manifestações corporais de movimento como originárias de necessidades cotidianas de um grupo social.',
        },
        {
          code: 'H10',
          description:
            'Reconhecer a necessidade de transformação de hábitos corporais em função das necessidades cinestésicas.',
        },
        {
          code: 'H11',
          description:
            'Reconhecer a linguagem corporal como meio de interação social, considerando os limites de desempenho e as alternativas de adaptação para diferentes indivíduos.',
        },
      ],
    },
    {
      code: 4,
      description:
        'Compreender a arte como saber cultural e estético gerador de significação e integrador da organização do mundo e da própria identidade.',
      skills: [
        {
          code: 'H12',
          description:
            'Reconhecer diferentes funções da arte, do trabalho da produção dos artistas em seus meios culturais.',
        },
        {
          code: 'H13',
          description:
            'Analisar as diversas produções artísticas como meio de explicar diferentes culturas, padrões de beleza e preconceitos.',
        },
        {
          code: 'H14',
          description:
            'Reconhecer o valor da diversidade artística e das inter-relações de elementos que se apresentam nas manifestações de vários grupos sociais e étnicos.',
        },
      ],
    },
    {
      code: 5,
      description:
        'Analisar, interpretar e aplicar recursos expressivos das linguagens, relacionando textos com seus contextos, mediante a natureza, função, organização, estrutura das manifestações, de acordo com as condições de produção e recepção.',
      skills: [
        {
          code: 'H15',
          description:
            'Estabelecer relações entre o texto literário e o momento de sua produção, situando aspectos do contexto histórico, social e político.',
        },
        {
          code: 'H16',
          description:
            'Relacionar informações sobre concepções artísticas e procedimentos de construção do texto literário.',
        },
        {
          code: 'H17',
          description:
            'Reconhecer a presença de valores sociais e humanos atualizáveis e permanentes no patrimônio literário nacional.',
        },
      ],
    },
    {
      code: 6,
      description:
        'Compreender e usar os sistemas simbólicos das diferentes linguagens como meios de organização cognitiva da realidade pela constituição de significados, expressão, comunicação e informação.',
      skills: [
        {
          code: 'H18',
          description:
            'Identificar os elementos que concorrem para a progressão temática e para a organização e estruturação de textos de diferentes gêneros e tipos.',
        },
        {
          code: 'H19',
          description:
            'Analisar a função da linguagem predominante nos textos em situações específicas de interlocução.',
        },
        {
          code: 'H20',
          description:
            'Reconhecer a importância do patrimônio linguístico para a preservação da memória e da identidade nacional.',
        },
      ],
    },
    {
      code: 7,
      description:
        'Confrontar opiniões e pontos de vista sobre as diferentes linguagens e suas manifestações específicas.',
      skills: [
        {
          code: 'H21',
          description:
            'Reconhecer em textos de diferentes gêneros, recursos verbais e não-verbais utilizados com a finalidade de criar e mudar comportamentos e hábitos.',
        },
        {
          code: 'H22',
          description:
            'Relacionar, em diferentes textos, opiniões, temas, assuntos e recursos linguísticos.',
        },
        {
          code: 'H23',
          description:
            'Inferir em um texto quais são os objetivos de seu produtor e quem é seu público alvo, pela análise dos procedimentos argumentativos utilizados.',
        },
        {
          code: 'H24',
          description:
            'Reconhecer no texto estratégias argumentativas empregadas para o convencimento do público, tais como a intimidação, sedução, comoção, chantagem, entre outras.',
        },
      ],
    },
    {
      code: 8,
      description:
        'Compreender e usar a língua portuguesa como língua materna, geradora de significação e integradora da organização do mundo e da própria identidade.',
      skills: [
        {
          code: 'H25',
          description:
            'Identificar, em textos de diferentes gêneros, as marcas linguísticas que singularizam as variedades linguísticas sociais, regionais e de registro.',
        },
        {
          code: 'H26',
          description:
            'Relacionar as variedades linguísticas a situações específicas de uso social.',
        },
        {
          code: 'H27',
          description:
            'Reconhecer os usos da norma padrão da língua portuguesa nas diferentes situações de comunicação.',
        },
      ],
    },
    {
      code: 9,
      description:
        'Entender os princípios, a natureza, a função e o impacto das tecnologias da comunicação e da informação na sua vida pessoal e social, no desenvolvimento do conhecimento, associando-o aos conhecimentos científicos, às linguagens que lhes dão suporte, às demais tecnologias, aos processos de produção e aos problemas que se propõem solucionar.',
      skills: [
        {
          code: 'H28',
          description:
            'Reconhecer a função e o impacto social das diferentes tecnologias da comunicação e informação.',
        },
        {
          code: 'H29',
          description:
            'Identificar pela análise de suas linguagens, as tecnologias da comunicação e informação.',
        },
        {
          code: 'H30',
          description:
            'Relacionar as tecnologias de comunicação e informação ao desenvolvimento das sociedades e ao conhecimento que elas produzem.',
        },
      ],
    },
  ],
  MT: [
    {
      code: 1,
      description:
        'Construir significados para os números naturais, inteiros, racionais e reais.',
      skills: [
        {
          code: 'H1',
          description:
            'Reconhecer, no contexto social, diferentes significados e representações dos números e operações - naturais, inteiros, racionais ou reais.',
        },
        {
          code: 'H2',
          description:
            'Identificar padrões numéricos ou princípios de contagem.',
        },
        {
          code: 'H3',
          description:
            'Resolver situação-problema envolvendo conhecimentos numéricos.',
        },
        {
          code: 'H4',
          description:
            'Avaliar a razoabilidade de um resultado numérico na construção de argumentos sobre afirmações quantitativas.',
        },
        {
          code: 'H5',
          description:
            'Avaliar propostas de intervenção na realidade utilizando conhecimentos numéricos.',
        },
      ],
    },
    {
      code: 2,
      description:
        'Utilizar o conhecimento geométrico para realizar a leitura e a representação da realidade e agir sobre ela.',
      skills: [
        {
          code: 'H6',
          description:
            'Interpretar a localização e a movimentação de pessoas/objetos no espaço tridimensional e sua representação no espaço bidimensional.',
        },
        {
          code: 'H7',
          description:
            'Identificar características de figuras planas ou espaciais.',
        },
        {
          code: 'H8',
          description:
            'Resolver situação-problema que envolva conhecimentos geométricos de espaço e forma.',
        },
        {
          code: 'H9',
          description:
            'Utilizar conhecimentos geométricos de espaço e forma na seleção de argumentos propostos como solução de problemas do cotidiano.',
        },
      ],
    },
    {
      code: 3,
      description:
        'Construir noções de grandezas e medidas para a compreensão da realidade e a solução de problemas do cotidiano.',
      skills: [
        {
          code: 'H10',
          description:
            'Identificar relações entre grandezas e unidades de medida.',
        },
        {
          code: 'H11',
          description:
            'Utilizar a noção de escalas na leitura de representação de situação do cotidiano.',
        },
        {
          code: 'H12',
          description:
            'Resolver situação-problema que envolva medidas de grandezas.',
        },
        {
          code: 'H13',
          description:
            'Avaliar o resultado de uma medição na construção de um argumento consistente.',
        },
        {
          code: 'H14',
          description:
            'Avaliar proposta de intervenção na realidade utilizando conhecimentos geométricos relacionados a grandezas e medidas.',
        },
      ],
    },
    {
      code: 4,
      description:
        'Construir noções de variação de grandezas para a compreensão da realidade e a solução de problemas do cotidiano.',
      skills: [
        {
          code: 'H15',
          description: 'Identificar a relação de dependência entre grandezas.',
        },
        {
          code: 'H16',
          description:
            'Resolver situação-problema envolvendo a variação de grandezas, direta ou inversamente proporcionais.',
        },
        {
          code: 'H17',
          description:
            'Analisar informações envolvendo a variação de grandezas como recurso para a construção de argumentação.',
        },
        {
          code: 'H18',
          description:
            'Avaliar propostas de intervenção na realidade envolvendo variação de grandezas.',
        },
      ],
    },
    {
      code: 5,
      description:
        'Modelar e resolver problemas que envolvem variáveis socioeconômicas ou técnico-científicas, usando representações algébricas.',
      skills: [
        {
          code: 'H19',
          description:
            'Identificar representações algébricas que expressem a relação entre grandezas.',
        },
        {
          code: 'H20',
          description:
            'Interpretar gráfico cartesiano que represente relações entre grandezas.',
        },
        {
          code: 'H21',
          description:
            'Resolver situação-problema cuja modelagem envolva conhecimentos algébricos.',
        },
        {
          code: 'H22',
          description:
            'Utilizar conhecimentos algébricos/geométricos como recurso para a construção de argumentação.',
        },
        {
          code: 'H23',
          description:
            'Avaliar propostas de intervenção na realidade utilizando conhecimentos algébricos.',
        },
      ],
    },
    {
      code: 6,
      description:
        'Interpretar informações de natureza científica e social obtidas da leitura de gráficos e tabelas, realizando previsão de tendência, extrapolação, interpolação e interpretação.',
      skills: [
        {
          code: 'H24',
          description:
            'Utilizar informações expressas em gráficos ou tabelas para fazer inferências.',
        },
        {
          code: 'H25',
          description:
            'Resolver problema com dados apresentados em tabelas ou gráficos.',
        },
        {
          code: 'H26',
          description:
            'Analisar informações expressas em gráficos ou tabelas como recurso para a construção de argumentos.',
        },
      ],
    },
    {
      code: 7,
      description:
        'Compreender o caráter aleatório e não-determinístico dos fenômenos naturais e sociais e utilizar instrumentos adeuados para medidas, determinação de amostras e cálculos de probailidade para interpretar informações de variáveis apresentadas em uma distribuição estatística.',
      skills: [
        {
          code: 'H27',
          description:
            'Calcular medidas de tendência central ou de dispersão de um conjunto de dados expressos em uma tabela de frequência de dados agrupados (não em classes) ou em gráficos.',
        },
        {
          code: 'H28',
          description:
            'Resolver situação-problema que envolva conhecimentos de estatística e probabilidade.',
        },
        {
          code: 'H29',
          description:
            'Utilizar conhecimentos de estatística e probabilidade como recurso para a construção de argumentação.',
        },
        {
          code: 'H30',
          description:
            'Avaliar propostas de intervenção na realidade utilizando conhecimentos de estatística e probabilidade.',
        },
      ],
    },
  ],
  CN: [
    {
      code: 1,
      description:
        'Compreender as ciências naturais e as tecnologias a elas associadas como construções humanas, percebendo seus papeis nos processos de produção e no desenvolvimento econômico e social da humanidade.',
      skills: [
        {
          code: 'H1',
          description:
            'Reconhecer características ou propriedades de fenômenos ondulatórios ou oscilatórios, relacionando-os a seus usos em diferentes contextos.',
        },
        {
          code: 'H2',
          description:
            'Associar a solução de problemas de comunicação, transporte, saúde ou outro, com o correspondente desenvolvimento científico e tecnológico.',
        },
        {
          code: 'H3',
          description:
            'Confrontar interpretações científicas com interpretações baseadas no senso comum, ao longo do tempo ou em diferentes culturas.',
        },
        {
          code: 'H4',
          description:
            'Avaliar propostas de intervenção no ambiente, considerando a qualidade da vida humanda ou medidas de conservação, recuperação ou utilização sustentável da biodiversidade.',
        },
      ],
    },
    {
      code: 2,
      description:
        'Identificar a presença e aplicar as tecnologias associadas às ciências naturais em diferentes contextos.',
      skills: [
        {
          code: 'H5',
          description:
            'Dimensionar circuitos ou dispositivos elétricos de uso cotidiano.',
        },
        {
          code: 'H6',
          description:
            'Relacionar informações para compreender manuais de instalação ou utilização de aparelhos, ou sistemas tecnológicos de uso comum.',
        },
        {
          code: 'H7',
          description:
            'Selecionar testes de controle, parâmetros ou critérios para a comparação de materiais e produtos, tendo em vista a defesa do consumidor, a saúde do trabalhador ou a qualidade de vida.',
        },
      ],
    },
    {
      code: 3,
      description:
        'Associar intervenções que resultam em degradação ou conservação ambiental a processos produtivos e sociais e a instrumentos ou ações científico-tecnológicos.',
      skills: [
        {
          code: 'H8',
          description:
            'Identificar etapas em processos de obtenção, transformação, utilização ou reciclagem de recursos naturais, energéticos ou matérias-primas, considerando processos biológicos, químicos ou físicos neles envolvidos.',
        },
        {
          code: 'H9',
          description:
            'Compreender a importância dos ciclos biogeoquímicos ou do fluxo energia para a vida, ou da ação de agentes ou fenõmenos que podem causar alterações nesses processos.',
        },
        {
          code: 'H10',
          description:
            'Analisar perturbações ambientais, identificando fontes, transporte e(ou) destino dos poluentes ou prevendo efeitos em sistemas natuais, produtivos ou sociais.',
        },
        {
          code: 'H11',
          description:
            'Reconhecer benefícios, limitações e aspectos éticos da biotecnologia, considerando estruturas e processos biológicos envolvidos em produtos biotecnológicos.',
        },
        {
          code: 'H12',
          description:
            'Avaliar impactos em ambientes naturais decorrentes de atividades sociais ou econômicas, considerando interesses contraditórios.',
        },
      ],
    },
    {
      code: 4,
      description:
        'Compreender interações entre organismos e ambiente, em particular aquelas relacionadas à saúde humana, relacionando conhecimentos científicos, aspectos culturais e características individuais.',
      skills: [
        {
          code: 'H13',
          description:
            'Reconhecer mecanismos de transmissão da vida, prevendo ou explicando a manifestação de características dos seres vivos.',
        },
        {
          code: 'H14',
          description:
            'Identificar padrões em fenômenos e processos vitais dos organismos, como manutenção do equilíbrio interno, defesa, relações com o ambiente, sexualidade, entre outros.',
        },
        {
          code: 'H15',
          description:
            'Interpretar modelos e experimentos para explicar fenômenos ou processos biológicos em qualquer nível de organização dos sistemas biológicos.',
        },
        {
          code: 'H16',
          description:
            'Compreender o papel da evolução na produção de padrões, processos biológicos ou na organização taxonômica dos seres vivos.',
        },
      ],
    },
    {
      code: 5,
      description:
        'Entender métodos e procedimentos próprios das ciências naturais e aplicá-los em diferentes contextos.',
      skills: [
        {
          code: 'H17',
          description:
            'Relacionar informações apresentadas em diferentes formas de linguagem e representação usadas nas ciências físicas, químicas ou biológicas, como texto discursivo, gráficos, tabelas, relações matemáticas ou linguagem simbólica.',
        },
        {
          code: 'H18',
          description:
            'Relacionar propriedades físicas, químicas ou biológicas de produtos, sistemas ou procedimentos tecnológicos às finalidades a que se destinam.',
        },
        {
          code: 'H19',
          description:
            'Avaliar métodos, processos ou procedimentos das ciências naturais que contribuam para diagnosticar ou solucionar problemas de ordem social, econômica ou ambiental.',
        },
      ],
    },
    {
      code: 6,
      description:
        'Apropriar-se de conhecimentos da física para, em situações problema, interpretar, avaliar ou planejar intervenções científico-tecnológicas.',
      skills: [
        {
          code: 'H20',
          description:
            'Caracterizar causas ou efeitos dos movimentos de partículas, substâncias, objetos ou corpos celestes.',
        },
        {
          code: 'H21',
          description:
            'Utilizar leis físicas e (ou) químicas para interpretar processos naturais ou tecnológicos inseridos no contexto da termodinâmica e(ou) do eletromagnetismo.',
        },
        {
          code: 'H22',
          description:
            'Compreender fenômenos decorrentes da interação entre a radiação e a matéria em suas manifestações em processos naturais ou tecnológicos, ou em suas implicações biológicas, sociais, econômicas ou ambientais.',
        },
        {
          code: 'H23',
          description:
            'Avaliar possibilidades de geração, uso ou transformação de energia em ambientes específicos, considerando implicações éticas, ambientais, sociais e /ou econômicas.',
        },
      ],
    },
    {
      code: 7,
      description:
        'Apropriar-se de conhecimentos da química para, em sistuações problema, interpretar, avalir ou planejar intervenções científico-tecnológicas.',
      skills: [
        {
          code: 'H24',
          description:
            'Utilizar códigos e nomenclatura da química para caracterizar materiais, substâncias ou transformações químicas.',
        },
        {
          code: 'H25',
          description:
            'Caracterizar materiais ou substâncias, identificando etapas, rendimentos ou implicações biológicas, sociais, econômicas ou ambientais de sua ontenção ou produção.',
        },
        {
          code: 'H26',
          description:
            'Avaliar implicações sociais, ambientais e/ou econômicas na produção ou no consumo de recursos energéticos ou minerais, identificando transformações químicas ou de energia envolvidas nesses processos.',
        },
        {
          code: 'H27',
          description:
            'Avaliar propostas de intervenção no meio ambiente aplicando conhecimentos químicos, observando riscos ou benefícios.',
        },
      ],
    },
    {
      code: 8,
      description:
        'Apropriar-se de conhecimentos da biologia para, em situações problema, interpretar, avaliar ou planejar intervenções científico-tecnológicas.',
      skills: [
        {
          code: 'H28',
          description:
            'Associar características adaptativas dos organismos com seu modo de vida ou com seus limites de distribuição em diferentes ambientes, em especial em ambientes brasileiros.',
        },
        {
          code: 'H29',
          description:
            'Interpretar experimentos ou técnicas que utilizam seres vivos, analisando implicações para o ambiente, a saúde, a produção de alimentos, matérias prias ou produtos industriais.',
        },
        {
          code: 'H30',
          description:
            'Avaliar propostas de alcance individual ou coletivo, identificando aquelas que visam à preservação e a implementação da saúde individual, coletiva ou do ambiente.',
        },
      ],
    },
  ],
  CH: [
    {
      code: 1,
      description:
        'Compreender os elementos culturais que constituem as identidades',
      skills: [
        {
          code: 'H1',
          description:
            'Interpretar historicamente e/ou geograficamente fontes documentais acerca de aspectos da cultura.',
        },
        {
          code: 'H2',
          description:
            'Analisar a produção da memória pelas sociedades humanas.',
        },
        {
          code: 'H3',
          description:
            'Associar as manifestações culturais do presente aos seus processos históricos.',
        },
        {
          code: 'H4',
          description:
            'Comparar pontos de vista expressos em diferentes fontes sobre determinado aspecto da cultura.',
        },
        {
          code: 'H5',
          description:
            'Identificar as manifestações ou representações da diversidade do patrimônio cultural e artístico em diferentes sociedades.',
        },
      ],
    },
    {
      code: 2,
      description:
        'Compreender as transformações dos espaços geográficos como produto das relações socioeconômicas e culturais de poder.',
      skills: [
        {
          code: 'H6',
          description:
            'Interpretar diferentes representações gráficas e cartográficas dos espaços geográficos.',
        },
        {
          code: 'H7',
          description:
            'Identificar os significados histórico-geográficos das relações de poder entre as nações.',
        },
        {
          code: 'H8',
          description:
            'Analisar a ação dos estados nacionais no que se refere à dinâmica dos fluxos populacionais e no enfrentamento de problemas de ordem econômico-social.',
        },
        {
          code: 'H9',
          description:
            'Comparar o significado histórico-geográfico das organizações políticas e socioeconômicas em escala local, regional ou mundial.',
        },
        {
          code: 'H10',
          description:
            'Reconhecer a dinâmica da organização dos movimentos sociais e a importância da participação da coletividade na transformação da realidade histórico-geográfica.',
        },
      ],
    },
    {
      code: 3,
      description:
        'Compreender a produção e o papel histórico das instituições sociais, políticas e econômicas, associando-as diferentes grupos, conflitos e movimentos sociais.',
      skills: [
        {
          code: 'H11',
          description:
            'Identificar registros de práticas de grupos sociais no tempo e no espaço.',
        },
        {
          code: 'H12',
          description:
            'Analisar o papel da justiça como instituição na organização das sociedades.',
        },
        {
          code: 'H13',
          description:
            'Analisar a atuação dos movimentos sociais que contribuíram para mudanças ou rupturas em processos de disputa pelo poder.',
        },
        {
          code: 'H14',
          description:
            'Comparar diferentes pontos de vista, presentes em textos analíticos e interpretativos, sobre situação ou fatos de natureza histórico-geográfica acerca das instituições sociais, políticas e econômicas.',
        },
        {
          code: 'H15',
          description:
            'Avaliar criticamente conflitos culturais, sociais, políticos, econômicos ou ambientais ao longo da história.',
        },
      ],
    },
    {
      code: 4,
      description:
        'Entender as transformações técnicas e tecnológicas e seu impacto nos processos de produção, no desenvolvimento do conhecimento e na vida social.',
      skills: [
        {
          code: 'H16',
          description:
            'Identificar registros sobre o papel das técnicas e tecnologias na organização do trabalho e/ou da vida social.',
        },
        {
          code: 'H17',
          description:
            'Analisar fatores que explicam o impacto das novas tecnologias no processo de territorialização da produção.',
        },
        {
          code: 'H18',
          description:
            'Analisar diferentes processos de produção ou circulação de riquezas e suas implicações sócio-espaciais.',
        },
        {
          code: 'H19',
          description:
            'Reconhecer as transformações técnicas e tecnológicas que determinam as várias formas de uso e apropriação dos espaços rural e urbano.',
        },
        {
          code: 'H20',
          description:
            'Selecionar argumentos favoráveis ou contrários às modificações impostas pelas novas tecnologias à vida social e ao mundo do trabalho.',
        },
      ],
    },
    {
      code: 5,
      description:
        'Utilizar os conhecimentos históricos para compreender e valorizar os fundamentos da cidadania e da democracia,favorecendo ua atuação consciente do indivíduo na sociedade.',
      skills: [
        {
          code: 'H21',
          description:
            'Identificar o papel dos meios de comunicação na construção da vida social.',
        },
        {
          code: 'H22',
          description:
            'Analisar as lutas sociais e conquistas obtidas no que se refere às mudanças nas legislações ou nas políticas públicas.',
        },
        {
          code: 'H23',
          description:
            'Analisar a importância dos valores éticos na estruturação política das sociedades.',
        },
        {
          code: 'H24',
          description:
            'Relacionar cidadania e democracia na organização das sociedades.',
        },
        {
          code: 'H25',
          description:
            'Identificar estratégias que promovam formas de inclusão social.',
        },
      ],
    },
    {
      code: 6,
      description:
        'Compreender a sociedade e a natureza, reconhecendo suas interações no espaço em diferentes contextos históricos e geográficos.',
      skills: [
        {
          code: 'H26',
          description:
            'Identificar em fontes diversas o processo de ocupação dos meios físicos e as relações da vida humana com a paisagem.',
        },
        {
          code: 'H27',
          description:
            'Analisar de maneira crítica as interações da sociedade com o meio físico, levando em consideração aspectos históricos e (ou) geográficos.',
        },
        {
          code: 'H28',
          description:
            'Relacionar o uso das tecnologias com os impactos sócio-ambientais em diferentes contextos histórico-geográficos.',
        },
        {
          code: 'H29',
          description:
            'Reconhecer a função dos recursos naturais na produção do espaço geográfico, relacionando-os ocm as mudanças provocadas pelas ações humanas.',
        },
        {
          code: 'H30',
          description:
            'Avaliar as relações entre preservação e degradação da vida no planeta nas diferentes escalas.',
        },
      ],
    },
  ],
} as const;

export async function seedCompetenciesAndSkills() {
  const areas = await prisma.area.findMany();
  const areaIdByCode = new Map(areas.map((a) => [a.code, a.id]));

  for (const [areaCode, competencies] of Object.entries(MATRIX) as Array<
    [AreaCode, CompetencySeed[]]
  >) {
    const areaId = areaIdByCode.get(areaCode);
    if (!areaId) throw new Error(`Area não encontrada: ${areaCode}`);

    for (const c of competencies) {
      const competency = await prisma.competency.upsert({
        where: { areaId_code: { areaId, code: c.code } },
        update: { description: c.description },
        create: { areaId, code: c.code, description: c.description },
      });

      for (const s of c.skills) {
        await prisma.skill.upsert({
          where: {
            competencyId_code: { competencyId: competency.id, code: s.code },
          },
          update: { description: s.description },
          create: {
            competencyId: competency.id,
            code: s.code,
            description: s.description,
          },
        });
      }
    }
  }

  const skillsCount = await prisma.skill.count();
  console.log(`seedCompetenciesAndSkills -- OK (total skills: ${skillsCount})`);
}
