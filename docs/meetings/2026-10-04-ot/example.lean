/-
LeanAgent 13기 OT 예제
Mathlib 없이 Lean 기본 환경에서 실행할 수 있습니다.
실행: lean example.lean
-/

-- P와 Q가 모두 참이면 Q와 P도 모두 참입니다.
example (P Q : Prop) : P ∧ Q → Q ∧ P := by
  intro h
  constructor
  · exact h.2
  · exact h.1

-- 같은 증명을 직접 증명항으로 적는 방법입니다. OT 심화 질문용입니다.
example (P Q : Prop) : P ∧ Q → Q ∧ P :=
  fun h => ⟨h.2, h.1⟩

/-
오류 시연: 위 첫 예제에서 첫 번째 exact h.2를 exact h.1로 바꿔보세요.
현재 목표는 Q이지만 h.1의 타입은 P여서 타입 오류가 발생합니다.
원래 코드로 되돌리면 검증을 통과합니다.
-/
