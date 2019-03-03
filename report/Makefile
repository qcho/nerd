MAINFILE = main
EXTRA_FILES := $(shell echo "images/*" "sections/*" "literature/*" "appendix/*" "settings/*")

## Inner workings
OBJECTS = $(shell find . -name "*.tex")
STYLES = $(shell find . -name "*.sty")
BIB = $(shell find . -name "*.bib")

TEMP2 := $(shell mkdir make 2>/dev/null)

.PHONY: all
all: $(MAINFILE).pdf

$(MAINFILE).pdf: $(OBJECTS) $(STYLES) $(EXTRA_FILES)
	./latexdockercmd.sh pdflatex -interaction=nonstopmode $(MAINFILE)
	./latexdockercmd.sh bibtex $(MAINFILE)
	./latexdockercmd.sh makeglossaries $(MAINFILE)
	./latexdockercmd.sh pdflatex -interaction=nonstopmode $(MAINFILE)

.PHONY: clean $(MAINFILE).pdf
clean:
	-rm -f *.aux
	-rm -f *.log
	-rm -f *.toc
	-rm -f *.bcf
	-rm -f *.bbl
	-rm -f *.blg
	-rm -f *.out

.PHONY: cleanall
cleanall: clean
	-rm -f *.pdf
	-rm -f *.ps
	-rm -f *.dvi
