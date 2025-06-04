{ pkgs ? import <nixpkgs> {} }:

(pkgs.buildFHSEnv {
  name = "npub-dev-env";
  targetPkgs = pkgs: with pkgs; [
    nodejs
    pnpm
    glibc
    stdenv.cc.cc.lib
    zlib
    openssl
    curl
    libgcc
    libuuid
    libxcrypt
    gcc-unwrapped.lib
  ];
  multiPkgs = pkgs: with pkgs; [
    glibc
    stdenv.cc.cc.lib
  ];
  shellHook = ''
    export NIX_LD=${pkgs.glibc}/lib/ld-linux-x86-64.so.2
    export NIX_LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath [
      pkgs.glibc
      pkgs.stdenv.cc.cc.lib
      pkgs.zlib
      pkgs.openssl
      pkgs.curl
      pkgs.libgcc
      pkgs.libuuid
      pkgs.libxcrypt
    ]}
    export LD_LIBRARY_PATH=$NIX_LD_LIBRARY_PATH:$LD_LIBRARY_PATH
  '';
}).env
