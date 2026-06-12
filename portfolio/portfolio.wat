(module
  ;; Memory
  (memory (export "memory") 1)

  ;; Calculate years of experience from start year
  ;; param: start_year (e.g. 2025), current_year (2026)
  ;; returns: months of experience
  (func (export "months_experience") (param $start_year i32) (param $start_month i32) (param $cur_year i32) (param $cur_month i32) (result i32)
    (i32.add
      (i32.mul
        (i32.sub (local.get $cur_year) (local.get $start_year))
        (i32.const 12)
      )
      (i32.sub (local.get $cur_month) (local.get $start_month))
    )
  )

  ;; Calculate a skill score 0-100 based on an input seed
  ;; Used to animate skill bars with deterministic values
  (func (export "skill_score") (param $seed i32) (param $base i32) (result i32)
    (local $v i32)
    (local.set $v
      (i32.rem_u
        (i32.add
          (i32.mul (local.get $seed) (i32.const 2654435761))
          (local.get $base)
        )
        (i32.const 40)
      )
    )
    (i32.add (local.get $v) (i32.const 60))
  )

  ;; Simple djb2-style hash of two ints — used to seed particle colours
  (func (export "hash2") (param $x i32) (param $y i32) (result i32)
    (local $h i32)
    (local.set $h (i32.const 5381))
    (local.set $h
      (i32.add
        (i32.add
          (i32.shl (local.get $h) (i32.const 5))
          (local.get $h)
        )
        (local.get $x)
      )
    )
    (local.set $h
      (i32.add
        (i32.add
          (i32.shl (local.get $h) (i32.const 5))
          (local.get $h)
        )
        (local.get $y)
      )
    )
    (i32.rem_u
      (i32.and (local.get $h) (i32.const 0x7fffffff))
      (i32.const 360)
    )
  )

  ;; Clamp integer between min and max
  (func (export "clamp") (param $v i32) (param $lo i32) (param $hi i32) (result i32)
    (select
      (select (local.get $lo) (local.get $v) (i32.lt_s (local.get $v) (local.get $lo)))
      (local.get $hi)
      (i32.lt_s
        (select (local.get $lo) (local.get $v) (i32.lt_s (local.get $v) (local.get $lo)))
        (local.get $hi)
      )
    )
  )

  ;; Grade-to-score: returns score * 10 as integer (e.g. 906 for 90.6%)
  (func (export "grade_stars") (param $score_times10 i32) (result i32)
    (local $stars i32)
    (local.set $stars (i32.const 0))
    (if (i32.ge_s (local.get $score_times10) (i32.const 900))
      (then (local.set $stars (i32.const 5)))
    )
    (if (i32.and
          (i32.lt_s (local.get $score_times10) (i32.const 900))
          (i32.ge_s (local.get $score_times10) (i32.const 800)))
      (then (local.set $stars (i32.const 4)))
    )
    (if (i32.and
          (i32.lt_s (local.get $score_times10) (i32.const 800))
          (i32.ge_s (local.get $score_times10) (i32.const 700)))
      (then (local.set $stars (i32.const 3)))
    )
    (local.get $stars)
  )
)
