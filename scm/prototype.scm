#lang racket

;; kernel  = ((1 0)(0 1))
;; pattern = 0 1 0 1 0 1 0 1 
;; thread  = u fu fu d fd fd u

(define (pattern-extend c m p)
  (cond
    ((>= c m) '())
    (else
     (cons
      (list-ref p (modulo c (length p)))
      (pattern-extend (+ c 1) m p)))))

(define (pattern-invert p)
  (map
   (lambda (i)
     (if (zero? i) 1 0))
   p))

(define (pattern->token kernel-code state)
  (if (zero? kernel-code)
      (if (eq? state "d") "fd" "d")  
      (if (eq? state "u") "fu" "u"))) ;; 1 = warp up
  
(define (kernel-row k i)
  (list-ref k (modulo i (length k))))

(define (kernel-col k i)
  (map
   (lambda (row)
     (kernel-row row i))
   k))

(define (kernel-invert k)
  (map
   (lambda (r)
     (pattern-invert r)
   k))) 

(define (pattern->thread pattern state) 
  (cond
    ((null? pattern) '())
    (else
     (let ((token (pattern->token (car pattern) state)))
       (cons
        token
        (pattern->thread
         (cdr pattern)
         (cond
           ((eq? token "u") "u")
           ((eq? token "d") "d")
           (else state))))))))

(define (kernel->warp-thread kernel warp-thread fabric-height)
  (pattern->thread
   (pattern-extend 0 fabric-height (kernel-col kernel warp-thread)) "?"))

(define (kernel->weft-thread kernel row fabric-width fabric-height)
  (cond
    ((>= row fabric-height) '())
    (else
     (let ((direction (modulo row 2)))
       (append
        (pattern->thread
         (if (zero? direction)
             (pattern-extend 0 fabric-width (kernel-row kernel row))
             (reverse (pattern-extend 0 fabric-width (kernel-row kernel row))))
         "?")
        (if (zero? direction)
            (list "r" "r")
            (list "l" "l"))
        (kernel->weft-thread kernel (+ row 1) fabric-width fabric-height))))))

(kernel->weft-thread
 (list (list 1 0)
       (list 0 1))
 0 4 4)

