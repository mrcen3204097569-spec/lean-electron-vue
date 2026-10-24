import { load } from 'js-yaml'
import { describe, expect, it } from 'vitest'
import { formatUpdateNotesYaml } from '../plugins/updateNotes.mts'

const sampleLatestYml = `version: 2.0.0
files:
  - url: app.exe
    sha512: abc
path: app.exe
sha512: abc
`

describe('formatUpdateNotesYaml', () => {
  it('appends notes as YAML strings that survive quotes, colons, hashes, and newlines', () => {
    const notes = {
      title: 'hello: # not a comment\nupdateEvil: pwned',
      subTitle: 'quote "inside"',
      content: 'line1\nline2: still text'
    }
    const document = load(sampleLatestYml + formatUpdateNotesYaml(notes)) as {
      version: string
      updateTitle: string
      updateSubTitle: string
      updateContent: string
      updateEvil?: string
    }

    expect(document.version).toBe('2.0.0')
    expect(document.updateTitle).toBe(notes.title)
    expect(document.updateSubTitle).toBe(notes.subTitle)
    expect(document.updateContent).toBe(notes.content)
    expect(document.updateEvil).toBeUndefined()
    expect(formatUpdateNotesYaml(notes).includes('\nupdateEvil:')).toBe(false)
  })
})
