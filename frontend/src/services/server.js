import express from "express";
import sqlite3 from "sqlite3";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const db = new sqlite3.Database("./cvData.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS cvs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, email TEXT, phone TEXT, url TEXT, summary TEXT, label TEXT, image TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cv_id INTEGER,
    address TEXT, postalCode TEXT, city TEXT, countryCode TEXT, region TEXT,
    FOREIGN KEY(cv_id) REFERENCES cvs(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cv_id INTEGER,
    network TEXT, username TEXT, url TEXT,
    FOREIGN KEY(cv_id) REFERENCES cvs(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS work (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cv_id INTEGER,
    name TEXT, position TEXT, url TEXT, startDate TEXT, endDate TEXT, summary TEXT, highlights TEXT,
    FOREIGN KEY(cv_id) REFERENCES cvs(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS volunteer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cv_id INTEGER,
    organization TEXT, position TEXT, url TEXT, startDate TEXT, endDate TEXT, summary TEXT, highlights TEXT,
    FOREIGN KEY(cv_id) REFERENCES cvs(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS education (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cv_id INTEGER,
    institution TEXT, url TEXT, area TEXT, studyType TEXT, startDate TEXT, endDate TEXT, score TEXT, courses TEXT,
    FOREIGN KEY(cv_id) REFERENCES cvs(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS awards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cv_id INTEGER,
    title TEXT, date TEXT, awarder TEXT, summary TEXT,
    FOREIGN KEY(cv_id) REFERENCES cvs(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cv_id INTEGER,
    name TEXT, date TEXT, issuer TEXT, url TEXT,
    FOREIGN KEY(cv_id) REFERENCES cvs(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS publications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cv_id INTEGER,
    name TEXT, publisher TEXT, releaseDate TEXT, url TEXT, summary TEXT,
    FOREIGN KEY(cv_id) REFERENCES cvs(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cv_id INTEGER,
    name TEXT, level TEXT, keywords TEXT,
    FOREIGN KEY(cv_id) REFERENCES cvs(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS languages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cv_id INTEGER,
    language TEXT, fluency TEXT,
    FOREIGN KEY(cv_id) REFERENCES cvs(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS interests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cv_id INTEGER,
    name TEXT, keywords TEXT,
    FOREIGN KEY(cv_id) REFERENCES cvs(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS references_list (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cv_id INTEGER,
    name TEXT,
    reference TEXT,
    FOREIGN KEY(cv_id) REFERENCES cvs(id)
    );`);

  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cv_id INTEGER,
    name TEXT, startDate TEXT, endDate TEXT, description TEXT, highlights TEXT, url TEXT,
    FOREIGN KEY(cv_id) REFERENCES cvs(id)
  )`);
});

app.post("/save-cv", (req, res) => {
  const data = req.body;
  const { jsonData } = req.body;

  db.serialize(() => {
    const stmt = db.prepare(
      `INSERT INTO cvs (name, email, phone, url, summary, label, image) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    stmt.run(
      jsonData.basics.name,
      jsonData.basics.email,
      jsonData.basics.phone,
      jsonData.basics.url,
      jsonData.basics.summary,
      jsonData.basics.label,
      jsonData.basics.image,
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        const cvId = this.lastID;

        const loc = jsonData.basics.location || {};
        db.run(
          `INSERT INTO locations (cv_id, address, postalCode, city, countryCode, region) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            cvId,
            loc.address,
            loc.postalCode,
            loc.city,
            loc.countryCode,
            loc.region,
          ],
        );

        (jsonData.basics.profiles || []).forEach((p) => {
          db.run(
            `INSERT INTO profiles (cv_id, network, username, url) VALUES (?, ?, ?, ?)`,
            [cvId, p.network, p.username, p.url],
          );
        });

        (jsonData.skills || []).forEach((s) => {
          db.run(
            `INSERT INTO skills (cv_id, name, level, keywords) VALUES (?, ?, ?, ?)`,
            [cvId, s.name, s.level, JSON.stringify(s.keywords)],
          );
        });

        (jsonData.work || []).forEach((w) => {
          db.run(
            `INSERT INTO work (cv_id, name, position, url, startDate, endDate, summary, highlights) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              cvId,
              w.name,
              w.position,
              w.url,
              w.startDate,
              w.endDate,
              w.summary,
              JSON.stringify(w.highlights),
            ],
          );
        });

        (jsonData.volunteer || []).forEach((v) => {
          db.run(
            `INSERT INTO volunteer (cv_id, organization, position, url, startDate, endDate, summary, highlights) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              cvId,
              v.organization,
              v.position,
              v.url,
              v.startDate,
              v.endDate,
              v.summary,
              JSON.stringify(v.highlights),
            ],
          );
        });

        (jsonData.education || []).forEach((e) => {
          db.run(
            `INSERT INTO education (cv_id, institution, url, area, studyType, startDate, endDate, score, courses) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              cvId,
              e.institution,
              e.url,
              e.area,
              e.studyType,
              e.startDate,
              e.endDate,
              e.score,
              JSON.stringify(e.courses),
            ],
          );
        });

        (jsonData.awards || []).forEach((a) => {
          db.run(
            `INSERT INTO awards (cv_id, title, date, awarder, summary) VALUES (?, ?, ?, ?, ?)`,
            [cvId, a.title, a.date, a.awarder, a.summary],
          );
        });

        (jsonData.certificates || []).forEach((c) => {
          db.run(
            `INSERT INTO certificates (cv_id, name, date, issuer, url) VALUES (?, ?, ?, ?, ?)`,
            [cvId, c.name, c.date, c.issuer, c.url],
          );
        });

        (jsonData.publications || []).forEach((p) => {
          db.run(
            `INSERT INTO publications (cv_id, name, publisher, releaseDate, url, summary) VALUES (?, ?, ?, ?, ?, ?)`,
            [cvId, p.name, p.publisher, p.releaseDate, p.url, p.summary],
          );
        });

        (jsonData.languages || []).forEach((l) => {
          db.run(
            `INSERT INTO languages (cv_id, language, fluency) VALUES (?, ?, ?)`,
            [cvId, l.language, l.fluency],
          );
        });

        (jsonData.interests || []).forEach((i) => {
          db.run(
            `INSERT INTO interests (cv_id, name, keywords) VALUES (?, ?, ?)`,
            [cvId, i.name, JSON.stringify(i.keywords)],
          );
        });

        (jsonData.references || []).forEach((r) => {
          db.run(
            `INSERT INTO references_list (cv_id, name, reference) VALUES (?, ?, ?)`,
            [cvId, r.name, r.reference],
          );
        });

        (jsonData.projects || []).forEach((p) => {
          db.run(
            `INSERT INTO projects (cv_id, name, startDate, endDate, description, highlights, url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              cvId,
              p.name,
              p.startDate,
              p.endDate,
              p.description,
              JSON.stringify(p.highlights),
              p.url,
            ],
          );
        });

        res.status(200).json({ message: "CV saved successfully!", cvId });
      },
    );
    stmt.finalize();
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
