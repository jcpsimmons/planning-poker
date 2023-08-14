{
  inputs.systems.url = "github:nix-systems/default";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs =
    { self
    , nixpkgs
    , flake-utils
    , systems
    ,
    }:
    flake-utils.lib.eachSystem (import systems)
      (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      rec {
        packages = flake-utils.lib.flattenTree {
          test = pkgs.yarn2nix-moretea.mkYarnPackage {
            name = "boba-server";
            version = "0.0.1";
            src = ./.;
            dontFixup = true;
            doDist = false;
            buildPhase = ''
              yarn install
            '';
            installPhase = ''
              mkdir -p $out/libexec/planningpokerserver
              mv node_modules $out/libexec/planningpokerserver/
              mv deps $out/libexec/planningpokerserver/
            '';
          };
        };

        # devShells.default = pkgs.mkShell {
        #   buildInputs = [
        #   ];
        # };
      });
}
