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
