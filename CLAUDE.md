# workflow-automation

## PR 규칙

- MUST: PR 본문은 `.github/pull_request_template.md` 의 `##` 섹션 5개를 그대로 쓴다.
- MUST NOT: 섹션 제목을 바꾸거나 지운다.
- MUST: 모든 섹션을 채운다. 해당 없으면 "없음" 이라고 적는다.
- MUST NOT: 안내 주석만 남기고 넘어간다. 미작성으로 처리된다.
- MUST: 템플릿을 복사해 채운 파일을 `gh pr create --body-file` 로 넘긴다. `--body` 는 템플릿을 무시한다.
- MUST: "검증" 에는 직접 실행해 확인한 것만 재현 절차로 적는다.
- MUST NOT: "검증" 에 `lint` / `build` 결과를 적는다. CI 가 돌린다.
- MUST: "리뷰 포인트" 에 확신 없는 판단, 세운 가정, 미검증 동작, 범위 밖 변경을 적는다.
- MUST NOT: "리뷰 포인트" 를 비운다.
- MUST: 한 PR 에 한 논리적 변경만 담는다.
- MUST NOT: 리팩터링과 기능 추가를 한 PR 에 섞는다.

`.github/workflows/pr-body.yml` 이 섹션 존재·작성 여부를, `.github/workflows/ci.yml` 이 lint·build 를 검사한다. 충돌 시 CI 결과가 우선한다.
