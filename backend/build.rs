fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("compiling proto");
    tonic_build::compile_protos("proto/hello.proto")?;
    tonic_build::compile_protos("proto/item.proto")?;
    Ok(())
}