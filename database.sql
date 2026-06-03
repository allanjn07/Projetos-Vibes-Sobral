SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS sobral_vibe
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sobral_vibe;

CREATE TABLE IF NOT EXISTS usuarios (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  nome      VARCHAR(100) NOT NULL,
  email     VARCHAR(150) NOT NULL UNIQUE,
  senha     VARCHAR(255) NOT NULL,
  role      ENUM('user','admin') NOT NULL DEFAULT 'user',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eventos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  titulo        VARCHAR(150) NOT NULL,
  categoria     ENUM('shows','academicos','historico','lazer','cultura','evento') NOT NULL,
  local         VARCHAR(200) NOT NULL,
  horario       VARCHAR(50)  NOT NULL,
  data_evento   DATE         NOT NULL,
  tipo          ENUM('ingresso','info') NOT NULL DEFAULT 'info',
  preco         VARCHAR(30)  DEFAULT NULL,
  link_ingresso VARCHAR(255) DEFAULT NULL,
  imagem_url    VARCHAR(255) DEFAULT NULL,
  criado_por    INT          DEFAULT NULL,
  criado_em     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS comentarios (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  evento_id  INT  NOT NULL,
  usuario_id INT  NOT NULL,
  texto      TEXT NOT NULL,
  criado_em  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evento_id)  REFERENCES eventos(id)  ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- =============================================
--  Usuários padrão
--  admin@sobralvibe.com  |  senha: admin123
--  user@sobralvibe.com   |  senha: user123
-- =============================================
INSERT INTO usuarios (nome, email, senha, role) VALUES
(
  'Administrador',
  'admin@sobralvibe.com',
  '$2a$10$Rl5yCnvRiXGDpVSdHFkM6.hZ9k3VQwXq1eU7NpLmT8JOGvBdAiK2i',
  'admin'
),
(
  'Usuario Teste',
  'user@sobralvibe.com',
  '$2a$10$wKvFRoUsed1BVnT3ROHmNuPmFaLXzKr6SsJ.yGKCv9CcMd5j/ORWG',
  'user'
);
