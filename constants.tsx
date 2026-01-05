
import { Recipe, VideoLesson } from './types';

export const RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Pão de Queijo Fit (Sem Óleo)',
    image: 'https://picsum.photos/id/488/800/600',
    category: 'Café da Manhã',
    description: 'Um pão de queijo incrivelmente leve usando iogurte desnatado em vez de óleo e gordura excessiva.',
    ingredients: [
      '1 xícara de polvilho doce',
      '1 xícara de polvilho azedo',
      '200g de queijo minas padrão ralado',
      '1 pote de iogurte grego natural sem açúcar',
      'Sal a gosto'
    ],
    instructions: [
      'Misture os polvilhos e o sal em uma tigela.',
      'Adicione o queijo ralado e o iogurte aos poucos até formar uma massa que desgrude das mãos.',
      'Faça bolinhas do tamanho desejado.',
      'Leve ao forno pré-aquecido a 180°C por cerca de 25-30 minutos ou até dourar.'
    ]
  },
  {
    id: '2',
    name: 'Brownie de Batata Doce & Cacau',
    image: 'https://picsum.photos/id/102/800/600',
    category: 'Doces Saudáveis',
    description: 'A textura perfeita do brownie tradicional sem farinha de trigo e sem açúcar refinado.',
    ingredients: [
      '2 xícaras de purê de batata doce cozida',
      '1/2 xícara de cacau em pó 100%',
      '2 ovos inteiros',
      '1/2 xícara de mel ou adoçante culinário',
      '1 colher de chá de fermento em pó'
    ],
    instructions: [
      'Bata todos os ingredientes no liquidificador, exceto o fermento.',
      'Adicione o fermento e misture delicadamente.',
      'Despeje em uma forma untada com óleo de coco e cacau.',
      'Asse por 25 minutos a 180°C.'
    ]
  },
  {
    id: '3',
    name: 'Lasanha de Abobrinha Premium',
    image: 'https://picsum.photos/id/493/800/600',
    category: 'Almoço/Jantar',
    description: 'Substituímos a massa pesada por fatias finas de abobrinha, mantendo todo o queijo e molho delicioso.',
    ingredients: [
      '2 abobrinhas grandes fatiadas finamente (lâminas)',
      '500g de patinho moído temperado',
      '300g de queijo mussarela light',
      'Molho de tomate caseiro',
      'Manjericão fresco'
    ],
    instructions: [
      'Grelhe levemente as fatias de abobrinha para retirar o excesso de água.',
      'Em um refratário, faça camadas: molho, abobrinha, carne e queijo.',
      'Repita até finalizar os ingredientes.',
      'Leve ao forno para gratinar por 20 minutos.'
    ]
  }
];

export const VIDEO_LESSONS: VideoLesson[] = [
  {
    id: 'v1',
    title: 'A Ciência das Substituições',
    thumbnail: 'https://picsum.photos/id/163/800/450',
    duration: '12:45',
    description: 'Aprenda como substituir farinha branca por fibras que não alteram o paladar, mas aceleram o seu metabolismo.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    // Added createdAt to satisfy VideoLesson type
    createdAt: 1738584000000
  },
  {
    id: 'v2',
    title: 'Dominando Doces sem Açúcar',
    thumbnail: 'https://picsum.photos/id/429/800/450',
    duration: '15:20',
    description: 'Um guia prático para criar sobremesas irresistíveis usando tâmaras e adoçantes naturais de alto desempenho.',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    // Added createdAt to satisfy VideoLesson type
    createdAt: 1738584000000
  },
  {
    id: 'v3',
    title: 'Café da Manhã que Queima Gordura',
    thumbnail: 'https://picsum.photos/id/312/800/450',
    duration: '08:15',
    description: 'Três receitas rápidas para começar o dia com energia e saciedade prolongada.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    // Added createdAt to satisfy VideoLesson type
    createdAt: 1738584000000
  }
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Mariana Silva",
    text: "Eu achava que precisava parar de comer pão para secar. O Sabor e Medida me ensinou o segredo da substituição. Perdi 8kg em 2 meses comendo bem!",
    role: "Mãe e Empresária",
    avatar: "https://i.pravatar.cc/150?u=mariana"
  },
  {
    id: 2,
    name: "Ricardo Mendes",
    text: "As receitas são práticas e o sabor é impressionante. O Brownie de batata doce virou meu vício de todo final de semana.",
    role: "Atleta amador",
    avatar: "https://i.pravatar.cc/150?u=ricardo"
  },
  {
    id: 3,
    name: "Juliana Costa",
    text: "O melhor investimento que fiz. Finalmente uma abordagem sem terrorismo nutricional.",
    role: "Nutricionista",
    avatar: "https://i.pravatar.cc/150?u=juliana"
  }
];

export const FAQS = [
  {
    question: "Preciso parar de comer pão?",
    answer: "De jeito nenhum! No Sabor e Medida você aprende a preparar pães com ingredientes que têm baixo índice glicêmico e alta saciedade."
  },
  {
    question: "Funciona para quem odeia dieta?",
    answer: "Sim! Nosso foco não é restrição, é prazer. Você vai comer pratos que ama, apenas preparados de uma forma que seu corpo aproveite melhor."
  },
  {
    question: "Preciso treinar pesado?",
    answer: "Embora a atividade física seja recomendada, o foco do nosso método é a reeducação através do paladar. Os resultados vêm primariamente da cozinha."
  },
  {
    question: "As receitas são fáceis?",
    answer: "Todas as nossas receitas foram testadas para serem feitas em menos de 30 minutos, com ingredientes que você encontra em qualquer supermercado."
  },
  {
    question: "Posso testar antes de pagar?",
    answer: "Oferecemos uma garantia incondicional de 7 dias. Se você não gostar das receitas, devolvemos seu dinheiro imediatamente."
  }
];
