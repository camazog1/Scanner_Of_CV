const CV_PLACEHOLDERS = {
  basics: {
    name: "Juan Pérez",
    label: "Programador",
    image: "",
    email: "juan@gmail.com",
    phone: "(912) 555-4321",
    url: "https://juanperez.com",
    summary: "Un resumen de Juan Pérez…",
    location: {
      countryCode: "US",
      region: "California",
      city: "San Francisco",
      postalCode: "CA 94115",
      address: "2712 Broadway St",
    },
    profiles: [
      {
        network: "Twitter",
        username: "juan",
        url: "https://twitter.com/juan",
      },
    ],
  },
  work: [
    {
      name: "Empresa",
      position: "Presidente",
      url: "https://empresa.com",
      startDate: "2013-01-01",
      endDate: "2014-01-01",
      summary: "Descripción…",
      highlights: ["Fundó la empresa"],
    },
  ],
  volunteer: [
    {
      organization: "Organización",
      position: "Voluntario",
      url: "https://organizacion.com/",
      startDate: "2012-01-01",
      endDate: "2013-01-01",
      summary: "Descripción…",
      highlights: ["Premiado como 'Voluntario del Mes'"],
    },
  ],
  education: [
    {
      institution: "Universidad",
      url: "https://institucion.com/",
      area: "Desarrollo de Software",
      studyType: "Licenciatura",
      startDate: "2011-01-01",
      endDate: "2013-01-01",
      score: "4.0",
      courses: ["DB1101 - SQL Básico"],
    },
  ],
  awards: [
    {
      title: "Premio",
      date: "2014-11-01",
      awarder: "Empresa",
      summary: "Reconocimiento por…",
    },
  ],
  certificates: [
    {
      name: "Certificado",
      date: "2021-11-07",
      issuer: "Empresa",
      url: "https://certificado.com",
    },
  ],
  publications: [
    {
      name: "Publicación",
      publisher: "Empresa",
      releaseDate: "2014-10-01",
      url: "https://publicacion.com",
      summary: "Descripción…",
    },
  ],
  skills: [
    {
      name: "Desarrollo Web",
      level: "Experto",
      keywords: ["HTML", "CSS", "JavaScript"],
    },
  ],
  languages: [
    {
      language: "Inglés",
      fluency: "Hablante nativo",
    },
  ],
  interests: [
    {
      name: "Vida silvestre",
      keywords: ["Hurones", "Unicornios"],
    },
  ],
  references: [
    {
      name: "Juana Pérez",
      reference: "Referencia…",
    },
  ],
  projects: [
    {
      name: "Proyecto",
      startDate: "2019-01-01",
      endDate: "2021-01-01",
      description: "Descripción...",
      highlights: ["Ganó premio en AIHacks 2016"],
      url: "https://proyecto.com/",
    },
  ],
};

export default CV_PLACEHOLDERS;