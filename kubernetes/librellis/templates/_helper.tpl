{{/*
    Общие аннотации образа для всех деплойментов
*/}}
{{- define "librellis.imageAnnotations" -}}
image-digest: "{{ .Values.backend.image.digest }}"
build-date: "{{ .Values.backend.image.buildDate }}"
commit-hash: "{{ .Values.backend.image.commitHash }}"
branch: "{{ .Values.backend.image.branch }}"
repository: "{{ .Values.backend.image.repository }}"
{{- end -}}