/*
  Warnings:

  - You are about to drop the column `bedrift` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `orgnr` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `postnr` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `sted` on the `user` table. All the data in the column will be lost.
  - Added the required column `bedriftId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `bedrift`,
    DROP COLUMN `orgnr`,
    DROP COLUMN `postnr`,
    DROP COLUMN `sted`,
    ADD COLUMN `bedriftId` VARCHAR(191) NOT NULL,
    ADD COLUMN `bildeUrl` VARCHAR(191) NULL,
    ADD COLUMN `emailVerified` DATETIME(3) NULL,
    ADD COLUMN `passwordResetExpires` DATETIME(3) NULL,
    ADD COLUMN `passwordResetToken` VARCHAR(191) NULL,
    ADD COLUMN `position` VARCHAR(191) NULL,
    ADD COLUMN `role` ENUM('ADMIN', 'PROSJEKTLEDER', 'LEDER', 'USER') NOT NULL DEFAULT 'ADMIN',
    ADD COLUMN `type` VARCHAR(191) NOT NULL DEFAULT 'Avvik';

-- CreateTable
CREATE TABLE `Bedrift` (
    `id` VARCHAR(191) NOT NULL,
    `navn` VARCHAR(191) NOT NULL,
    `orgnr` VARCHAR(191) NOT NULL,
    `postnr` VARCHAR(191) NOT NULL,
    `sted` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `hmsHandbokUrl` VARCHAR(191) NULL,

    UNIQUE INDEX `Bedrift_orgnr_key`(`orgnr`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_email_token_key`(`email`, `token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prosjekt` (
    `id` VARCHAR(191) NOT NULL,
    `navn` VARCHAR(191) NOT NULL,
    `beskrivelse` VARCHAR(191) NULL,
    `startDato` DATETIME(3) NOT NULL,
    `sluttDato` DATETIME(3) NOT NULL,
    `status` ENUM('IKKE_STARTET', 'STARTET', 'AVSLUTTET') NOT NULL DEFAULT 'IKKE_STARTET',
    `bedriftId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Oppgave` (
    `id` VARCHAR(191) NOT NULL,
    `tittel` VARCHAR(191) NOT NULL,
    `beskrivelse` VARCHAR(191) NOT NULL,
    `startDato` DATETIME(3) NOT NULL,
    `sluttDato` DATETIME(3) NOT NULL,
    `status` ENUM('IKKE_STARTET', 'I_GANG', 'UNDER_REVIEW', 'FULLFORT') NOT NULL,
    `prioritet` ENUM('LAV', 'MEDIUM', 'HOY', 'KRITISK') NOT NULL,
    `estimertTid` DOUBLE NULL,
    `faktiskTid` DOUBLE NULL,
    `brukerId` VARCHAR(191) NOT NULL,
    `prosjektId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kommentar` (
    `id` VARCHAR(191) NOT NULL,
    `innhold` VARCHAR(191) NOT NULL,
    `opprettetAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `oppgaveId` VARCHAR(191) NOT NULL,
    `brukerId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fil` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `navn` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `oppgaveId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TimeEntry` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `hours` DOUBLE NOT NULL,
    `description` VARCHAR(191) NULL,
    `prosjektId` VARCHAR(191) NOT NULL,
    `oppgaveId` VARCHAR(191) NULL,
    `brukerId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PasswordResetToken_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HMSDokument` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `bedriftId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Skjema` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'Avvik',
    `tittel` VARCHAR(191) NOT NULL,
    `innhold` JSON NOT NULL,
    `solution` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Ubehandlet',
    `opprettetDato` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `bedriftId` VARCHAR(191) NOT NULL,
    `behandlerId` VARCHAR(191) NULL,
    `opprettetAvId` VARCHAR(191) NOT NULL,
    `prosjektId` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `avviksnummer` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Skjema_avviksnummer_key`(`avviksnummer`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EndringsSkjema` (
    `id` VARCHAR(191) NOT NULL,
    `changeNumber` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `submittedBy` VARCHAR(191) NOT NULL,
    `implementationDate` DATETIME(3) NOT NULL,
    `followUpPerson` VARCHAR(191) NULL,
    `comments` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Ubehandlet',
    `opprettetDato` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `bedriftId` VARCHAR(191) NOT NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `solution` VARCHAR(191) NULL,
    `behandlerId` VARCHAR(191) NULL,
    `opprettetAvId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'Endring',
    `prosjektId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SJASkjema` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'SJA',
    `jobTitle` VARCHAR(191) NOT NULL,
    `jobLocation` VARCHAR(191) NOT NULL,
    `jobDate` VARCHAR(191) NOT NULL,
    `participants` VARCHAR(191) NOT NULL,
    `jobDescription` VARCHAR(191) NOT NULL,
    `identifiedRisks` VARCHAR(191) NOT NULL,
    `riskMitigation` VARCHAR(191) NOT NULL,
    `responsiblePerson` VARCHAR(191) NOT NULL,
    `approvalDate` VARCHAR(191) NULL,
    `comments` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Ubehandlet',
    `opprettetDato` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `bedriftId` VARCHAR(191) NOT NULL,
    `opprettetAvId` VARCHAR(191) NOT NULL,
    `behandlerId` VARCHAR(191) NULL,
    `prosjektId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bilde` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `navn` VARCHAR(191) NOT NULL,
    `prosjektId` VARCHAR(191) NOT NULL,
    `oppgaveId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `skjemaId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endringsSkjemaId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sluttrapport` (
    `id` VARCHAR(191) NOT NULL,
    `prosjektId` VARCHAR(191) NOT NULL,
    `generertDato` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pdfUrl` VARCHAR(191) NOT NULL,
    `generertAvId` VARCHAR(191) NOT NULL,
    `kommentarer` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `read` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SJAMal` (
    `id` VARCHAR(191) NOT NULL,
    `navn` VARCHAR(191) NOT NULL,
    `jobTitle` VARCHAR(191) NOT NULL,
    `jobLocation` VARCHAR(191) NOT NULL,
    `participants` VARCHAR(191) NOT NULL,
    `jobDescription` VARCHAR(191) NOT NULL,
    `identifiedRisks` VARCHAR(191) NOT NULL,
    `riskMitigation` VARCHAR(191) NOT NULL,
    `responsiblePerson` VARCHAR(191) NOT NULL,
    `comments` VARCHAR(191) NULL,
    `bedriftId` VARCHAR(191) NOT NULL,
    `opprettetAvId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RisikoVurdering` (
    `id` VARCHAR(191) NOT NULL,
    `prosjektId` VARCHAR(191) NOT NULL,
    `dato` DATETIME(3) NOT NULL,
    `utfortAv` VARCHAR(191) NOT NULL,
    `godkjentAv` VARCHAR(191) NULL,
    `fareBeskrivelse` TEXT NOT NULL,
    `arsaker` TEXT NOT NULL,
    `konsekvenser` TEXT NOT NULL,
    `sannsynlighet` INTEGER NOT NULL,
    `konsekvensGrad` INTEGER NOT NULL,
    `risikoVerdi` INTEGER NOT NULL,
    `eksisterendeTiltak` TEXT NOT NULL,
    `nyeTiltak` TEXT NOT NULL,
    `ansvarlig` VARCHAR(191) NOT NULL,
    `tidsfrist` DATETIME(3) NOT NULL,
    `restRisiko` TEXT NOT NULL,
    `risikoAkseptabel` BOOLEAN NOT NULL,
    `oppfolging` TEXT NOT NULL,
    `nesteGjennomgang` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Ubehandlet',
    `opprettetDato` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `bedriftId` VARCHAR(191) NOT NULL,
    `opprettetAvId` VARCHAR(191) NOT NULL,
    `behandlerId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stoffkartotek` (
    `id` VARCHAR(191) NOT NULL,
    `produktnavn` VARCHAR(191) NOT NULL,
    `produsent` VARCHAR(191) NULL,
    `databladUrl` VARCHAR(191) NULL,
    `beskrivelse` TEXT NULL,
    `bruksomrade` VARCHAR(191) NULL,
    `opprettetAvId` VARCHAR(191) NOT NULL,
    `bedriftId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FareSymbolMapping` (
    `id` VARCHAR(191) NOT NULL,
    `symbol` ENUM('BRANNFARLIG', 'ETSENDE', 'GIFTIG', 'HELSEFARE', 'MILJOFARE', 'OKSIDERENDE', 'EKSPLOSJONSFARLIG', 'GASS_UNDER_TRYKK') NOT NULL,
    `stoffkartotekId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FareSymbolMapping_stoffkartotekId_symbol_key`(`stoffkartotekId`, `symbol`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_BrukerProsjekter` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_BrukerProsjekter_AB_unique`(`A`, `B`),
    INDEX `_BrukerProsjekter_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_bedriftId_fkey` FOREIGN KEY (`bedriftId`) REFERENCES `Bedrift`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prosjekt` ADD CONSTRAINT `Prosjekt_bedriftId_fkey` FOREIGN KEY (`bedriftId`) REFERENCES `Bedrift`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Oppgave` ADD CONSTRAINT `Oppgave_brukerId_fkey` FOREIGN KEY (`brukerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Oppgave` ADD CONSTRAINT `Oppgave_prosjektId_fkey` FOREIGN KEY (`prosjektId`) REFERENCES `Prosjekt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kommentar` ADD CONSTRAINT `Kommentar_oppgaveId_fkey` FOREIGN KEY (`oppgaveId`) REFERENCES `Oppgave`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kommentar` ADD CONSTRAINT `Kommentar_brukerId_fkey` FOREIGN KEY (`brukerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fil` ADD CONSTRAINT `Fil_oppgaveId_fkey` FOREIGN KEY (`oppgaveId`) REFERENCES `Oppgave`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimeEntry` ADD CONSTRAINT `TimeEntry_prosjektId_fkey` FOREIGN KEY (`prosjektId`) REFERENCES `Prosjekt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimeEntry` ADD CONSTRAINT `TimeEntry_oppgaveId_fkey` FOREIGN KEY (`oppgaveId`) REFERENCES `Oppgave`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimeEntry` ADD CONSTRAINT `TimeEntry_brukerId_fkey` FOREIGN KEY (`brukerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HMSDokument` ADD CONSTRAINT `HMSDokument_bedriftId_fkey` FOREIGN KEY (`bedriftId`) REFERENCES `Bedrift`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Skjema` ADD CONSTRAINT `Skjema_bedriftId_fkey` FOREIGN KEY (`bedriftId`) REFERENCES `Bedrift`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Skjema` ADD CONSTRAINT `Skjema_behandlerId_fkey` FOREIGN KEY (`behandlerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Skjema` ADD CONSTRAINT `Skjema_opprettetAvId_fkey` FOREIGN KEY (`opprettetAvId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Skjema` ADD CONSTRAINT `Skjema_prosjektId_fkey` FOREIGN KEY (`prosjektId`) REFERENCES `Prosjekt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EndringsSkjema` ADD CONSTRAINT `EndringsSkjema_bedriftId_fkey` FOREIGN KEY (`bedriftId`) REFERENCES `Bedrift`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EndringsSkjema` ADD CONSTRAINT `EndringsSkjema_behandlerId_fkey` FOREIGN KEY (`behandlerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EndringsSkjema` ADD CONSTRAINT `EndringsSkjema_opprettetAvId_fkey` FOREIGN KEY (`opprettetAvId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EndringsSkjema` ADD CONSTRAINT `EndringsSkjema_prosjektId_fkey` FOREIGN KEY (`prosjektId`) REFERENCES `Prosjekt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJASkjema` ADD CONSTRAINT `SJASkjema_bedriftId_fkey` FOREIGN KEY (`bedriftId`) REFERENCES `Bedrift`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJASkjema` ADD CONSTRAINT `SJASkjema_opprettetAvId_fkey` FOREIGN KEY (`opprettetAvId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJASkjema` ADD CONSTRAINT `SJASkjema_behandlerId_fkey` FOREIGN KEY (`behandlerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJASkjema` ADD CONSTRAINT `SJASkjema_prosjektId_fkey` FOREIGN KEY (`prosjektId`) REFERENCES `Prosjekt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bilde` ADD CONSTRAINT `Bilde_prosjektId_fkey` FOREIGN KEY (`prosjektId`) REFERENCES `Prosjekt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bilde` ADD CONSTRAINT `Bilde_oppgaveId_fkey` FOREIGN KEY (`oppgaveId`) REFERENCES `Oppgave`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bilde` ADD CONSTRAINT `Bilde_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bilde` ADD CONSTRAINT `Bilde_skjemaId_fkey` FOREIGN KEY (`skjemaId`) REFERENCES `Skjema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bilde` ADD CONSTRAINT `Bilde_endringsSkjemaId_fkey` FOREIGN KEY (`endringsSkjemaId`) REFERENCES `EndringsSkjema`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sluttrapport` ADD CONSTRAINT `Sluttrapport_prosjektId_fkey` FOREIGN KEY (`prosjektId`) REFERENCES `Prosjekt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sluttrapport` ADD CONSTRAINT `Sluttrapport_generertAvId_fkey` FOREIGN KEY (`generertAvId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJAMal` ADD CONSTRAINT `SJAMal_bedriftId_fkey` FOREIGN KEY (`bedriftId`) REFERENCES `Bedrift`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJAMal` ADD CONSTRAINT `SJAMal_opprettetAvId_fkey` FOREIGN KEY (`opprettetAvId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RisikoVurdering` ADD CONSTRAINT `RisikoVurdering_prosjektId_fkey` FOREIGN KEY (`prosjektId`) REFERENCES `Prosjekt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RisikoVurdering` ADD CONSTRAINT `RisikoVurdering_bedriftId_fkey` FOREIGN KEY (`bedriftId`) REFERENCES `Bedrift`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RisikoVurdering` ADD CONSTRAINT `RisikoVurdering_opprettetAvId_fkey` FOREIGN KEY (`opprettetAvId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RisikoVurdering` ADD CONSTRAINT `RisikoVurdering_behandlerId_fkey` FOREIGN KEY (`behandlerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stoffkartotek` ADD CONSTRAINT `Stoffkartotek_opprettetAvId_fkey` FOREIGN KEY (`opprettetAvId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stoffkartotek` ADD CONSTRAINT `Stoffkartotek_bedriftId_fkey` FOREIGN KEY (`bedriftId`) REFERENCES `Bedrift`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FareSymbolMapping` ADD CONSTRAINT `FareSymbolMapping_stoffkartotekId_fkey` FOREIGN KEY (`stoffkartotekId`) REFERENCES `Stoffkartotek`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BrukerProsjekter` ADD CONSTRAINT `_BrukerProsjekter_A_fkey` FOREIGN KEY (`A`) REFERENCES `Prosjekt`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BrukerProsjekter` ADD CONSTRAINT `_BrukerProsjekter_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
