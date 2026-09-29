import { type InstalledSkillRecord } from './installed.ts';
export declare function readInstalledSkill(roots: string[], key: string): Promise<{
    item: InstalledSkillRecord;
    markdown: string;
}>;
/** Rename the selected entry out of discovery before deletion. Symlink targets are never removed. */
export declare function removeInstalledSkill(roots: string[], key: string, allowUninstall: boolean): Promise<InstalledSkillRecord>;
