import { db } from "./config/firebase";
import { collection, addDoc } from "firebase/firestore";

const estabelecimentos = [
  // --- ALIMENTAÇÃO ---
  {
    nome: "Pizzaria do Gordo",
    tipo: "loja",
    categoria: "Alimentação",
    endereco: "Rua Conde de Bonfim, 400 - Saens Peña",
    whatsapp: "21999991111",
    tags: ["pizza", "delivery", "jantar", "massas"],
    lat: -22.9245,
    lng: -43.233,
  },
  {
    nome: "Hambúrguer Artesanal Tijuca",
    tipo: "loja",
    categoria: "Alimentação",
    endereco: "Rua Uruguai, 300 - Uruguai",
    whatsapp: "21999992222",
    tags: ["burger", "lanche", "artesanal", "batata"],
    lat: -22.9325,
    lng: -43.246,
  },
  {
    nome: "Marmitas da Tia Célia",
    tipo: "autonomo",
    categoria: "Alimentação",
    endereco: "Rua Haddock Lobo, 100 - Afonso Pena",
    whatsapp: "21999993333",
    tags: ["marmita", "almoço", "caseira", "barato"],
    lat: -22.918,
    lng: -43.219,
  },
  {
    nome: "Açaí do Posto",
    tipo: "loja",
    categoria: "Alimentação",
    endereco: "Rua Mariz e Barros, 800",
    whatsapp: "21999994444",
    tags: ["açaí", "sorvete", "lanche"],
    lat: -22.916,
    lng: -43.217,
  },

  // --- SERVIÇOS ---
  {
    nome: "Chaveiro 24h Express",
    tipo: "autonomo",
    categoria: "Serviços",
    endereco: "Praça Varnhagen - Tijuca",
    whatsapp: "21988881111",
    tags: ["chaveiro", "fechadura", "emergência", "autos"],
    lat: -22.9205,
    lng: -43.2255,
  },
  {
    nome: "Eletricista Sr. João",
    tipo: "autonomo",
    categoria: "Serviços",
    endereco: "Atendimento em Domicílio",
    whatsapp: "21988882222",
    tags: ["eletricista", "reparos", "luz", "instalação"],
    lat: -22.928,
    lng: -43.238,
  },
  {
    nome: "Lavanderia Lava & Seca",
    tipo: "loja",
    categoria: "Serviços",
    endereco: "Rua Santo Afonso, 50",
    whatsapp: "21988883333",
    tags: ["lavanderia", "roupas", "lavagem"],
    lat: -22.925,
    lng: -43.231,
  },

  // --- SAÚDE ---
  {
    nome: "Drogaria Venancio",
    tipo: "loja",
    categoria: "Saúde",
    endereco: "Rua Conde de Bonfim, 350",
    whatsapp: "21977771111",
    tags: ["farmácia", "remédio", "perfumaria"],
    lat: -22.9235,
    lng: -43.232,
  },
  {
    nome: "Dra. Carla - Dentista",
    tipo: "autonomo",
    categoria: "Saúde",
    endereco: "Rua General Roca, 900 - Sala 202",
    whatsapp: "21977772222",
    tags: ["dentista", "odonto", "clareamento"],
    lat: -22.926,
    lng: -43.234,
  },

  // --- AUTOMOTIVO ---
  {
    nome: "Oficina do Beto",
    tipo: "loja",
    categoria: "Automotivo",
    endereco: "Rua São Francisco Xavier, 100",
    whatsapp: "21966661111",
    tags: ["mecânico", "carro", "oficina", "revisão"],
    lat: -22.914,
    lng: -43.22,
  },
  {
    nome: "Borracheiro da Esquina",
    tipo: "autonomo",
    categoria: "Automotivo",
    endereco: "Rua Barão de Mesquita, 400",
    whatsapp: "21966662222",
    tags: ["pneu", "borracheiro", "moto"],
    lat: -22.922,
    lng: -43.23,
  },

  // --- PETS ---
  {
    nome: "PetShop Amigo Fiel",
    tipo: "loja",
    categoria: "Pets",
    endereco: "Rua Desembargador Izidro, 20",
    whatsapp: "21955551111",
    tags: ["pet", "banho", "tosa", "ração"],
    lat: -22.927,
    lng: -43.235,
  },
  {
    nome: "Veterinária 24h Tijuca",
    tipo: "loja",
    categoria: "Pets",
    endereco: "Rua Conde de Bonfim, 800",
    whatsapp: "21955552222",
    tags: ["veterinário", "emergência", "pet"],
    lat: -22.935,
    lng: -43.25,
  },
  {
    nome: "Dog Walker Pedro",
    tipo: "autonomo",
    categoria: "Pets",
    endereco: "Atende na Praça Saens Peña",
    whatsapp: "21955553333",
    tags: ["passeador", "cães", "adestrador"],
    lat: -22.924,
    lng: -43.2328,
  },
];

export async function popularBanco() {
  const colRef = collection(db, "estabelecimentos");
  console.log("Iniciando população...");

  for (const item of estabelecimentos) {
    try {
      await addDoc(colRef, item);
      console.log(`✅ Adicionado: ${item.nome}`);
    } catch (e) {
      console.error(`❌ Erro ao adicionar ${item.nome}:`, e);
    }
  }
  console.log("🏁 Processo finalizado!");
  alert("Banco de dados populado com sucesso! Verifique o console.");
}
