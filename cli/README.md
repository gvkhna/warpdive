# Setup/Install

```sh
asdf plugin add golang
asdf plugin add golangci-lint
asdf plugin add protoc
asdf install

# go install github.com/google/go-licenses@latest
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
asdf reshim
make proto
make bin
DEBUG_WARPDIVE=1 ./build/warpdive <IMAGEID> --source podman
```
