---
name: CLAUDE
description: fQRGen 공개 레포 (_public) 프로젝트 가이드
date: 2026-04-11
---

글로벌 규칙(언어, 스타일, 네이밍 등)은 `~/.claude/CLAUDE.md` 참조.

# 프로젝트 개요

fQRGen macOS 앱의 공개 리소스(API 문서, MCP, Agent 스킬, 다국어, 매뉴얼)를 포함하는 독립 Git 저장소.

# 구조

* `agents/` - AI Agent 스킬 (claude, gemini)
* `api/` - OpenAPI 명세
* `localization/` - 다국어 리소스
* `manual/` - 사용자 매뉴얼
* `mcp/` - MCP 서버

# agents/claude 수정 시 동기화 필수

`agents/claude/` 폴더의 내용을 수정하면, **프로젝트 20 (f-claude-plugins)** 의 `fQRGen/` 폴더도 반드시 함께 수정할 것.

* 경로: `~/_git/__all/f-claude-plugins/fQRGen/`
* 이유: f-claude-plugins가 Claude Code 마켓플레이스 배포용 통합 레포이므로, 양쪽이 동기화되어야 함
