export interface UpdateNotes {
  title: string
  subTitle: string
  content: string
}

/**
 * JSON.stringify 的结果是合法的 YAML 双引号标量。
 * 标题或正文里的引号、冒号、# 和换行因此不会把 latest*.yml 拆坏。
 */
export function formatUpdateNotesYaml(notes: UpdateNotes): string {
  return [
    `updateTitle: ${JSON.stringify(notes.title)}`,
    `updateSubTitle: ${JSON.stringify(notes.subTitle)}`,
    `updateContent: ${JSON.stringify(notes.content)}`,
    ''
  ].join('\n')
}

/** 接到已有 latest*.yml 后面。原文末尾没有换行时先补一行，避免把最后一个字段粘在一起。 */
export function joinUpdateNotes(existing: string, notes: UpdateNotes): string {
  const notesYaml = formatUpdateNotesYaml(notes)
  if (existing.length === 0 || existing.endsWith('\n')) return existing + notesYaml
  return `${existing}\n${notesYaml}`
}
